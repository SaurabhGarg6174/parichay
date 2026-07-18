package com.aggarjan.patrika.parichay.modules.auth.service.impl;

import com.aggarjan.patrika.parichay.core.security.JwtService;
import com.aggarjan.patrika.parichay.modules.auth.dto.*;
import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.model.UserProfile;
import com.aggarjan.patrika.parichay.modules.auth.repository.RoleRepository;
import com.aggarjan.patrika.parichay.modules.auth.repository.UserRepository;
import com.aggarjan.patrika.parichay.modules.auth.repository.UserProfileRepository;
import com.aggarjan.patrika.parichay.modules.auth.repository.PasswordResetTokenRepository;
import com.aggarjan.patrika.parichay.modules.auth.model.PasswordResetToken;
import com.aggarjan.patrika.parichay.modules.auth.service.AuthenticationService;
import com.aggarjan.patrika.parichay.modules.auth.service.RefreshTokenService;
import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {
        private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
        private static final int ACCOUNT_LOCKOUT_MINUTES = 15;

        private final UserRepository repository;
        private final RoleRepository roleRepository;
        private final UserProfileRepository userProfileRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final RefreshTokenService refreshTokenService;
        private final AuthenticationManager authenticationManager;

        @Value("${app.frontend.base-url}")
        private String frontendBaseUrl;

        @Override
        public AuthenticationResponse register(RegisterRequest request) {
                if (repository.existsByEmail(request.email())) {
                        throw new BadRequestException("Email already registered with another account");
                }

                Role userRole = roleRepository.findByName("USER")
                                .orElseGet(() -> roleRepository.save(
                                                Role.builder().name("USER").description("Default user role").build()));

                var user = User.builder()
                                .email(request.email())
                                .password(passwordEncoder.encode(request.password()))
                                .roles(new HashSet<>(Set.of(userRole)))
                                .build();

                var savedUser = repository.save(user);

                var profile = UserProfile.builder()
                                .fullName(request.name())
                                .user(savedUser)
                                .build();
                userProfileRepository.save(profile);

                var jwtToken = jwtService.generateToken(savedUser);
                var refreshToken = refreshTokenService.createToken(savedUser);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Override
        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.email(),
                                                        request.password()));
                } catch (BadCredentialsException ex) {
                        registerFailedLoginAttempt(request.email());
                        throw ex;
                }

                var user = repository.findByEmail(request.email())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + request.email()));

                if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
                        user.setFailedLoginAttempts(0);
                        user.setLockedUntil(null);
                        repository.save(user);
                }

                var jwtToken = jwtService.generateToken(user);
                var refreshToken = refreshTokenService.createToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        private void registerFailedLoginAttempt(String email) {
                repository.findByEmail(email).ifPresent(user -> {
                        int attempts = user.getFailedLoginAttempts() + 1;
                        user.setFailedLoginAttempts(attempts);
                        if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                                user.setLockedUntil(LocalDateTime.now().plusMinutes(ACCOUNT_LOCKOUT_MINUTES));
                        }
                        repository.save(user);
                });
        }

        @Override
        public void changePassword(ChangePasswordRequest request, String email) {
                var user = repository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                        throw new BadRequestException("Current password does not match");
                }

                if (!request.newPassword().equals(request.confirmationPassword())) {
                        throw new BadRequestException("New password and confirmation password do not match");
                }

                user.setPassword(passwordEncoder.encode(request.newPassword()));
                repository.save(user);
        }

        @Override
        public UserDto getCurrentUser(String email) {
                User user = repository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                // Fetch profile
                UserProfile profile = userProfileRepository.findByUserId(user.getId())
                                .orElse(UserProfile.builder().fullName(
                                                user.getProfile() != null ? user.getProfile().getFullName() : "Unknown")
                                                .build());

                Set<String> roles = user.getRoles().stream()
                                .map(Role::getName)
                                .collect(Collectors.toSet());

                return new UserDto(
                                user.getId(),
                                user.getEmail(),
                                profile.getFullName(),
                                roles,
                                user.isEnabled());
        }

        @Override
        public AuthenticationResponse refreshToken(String rawRefreshToken) {
                var result = refreshTokenService.rotate(rawRefreshToken);
                var accessToken = jwtService.generateToken(result.user());
                return AuthenticationResponse.builder()
                                .token(accessToken)
                                .refreshToken(result.rawToken())
                                .build();
        }

        @Override
        public void logout(String rawRefreshToken) {
                if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
                        refreshTokenService.revoke(rawRefreshToken);
                }
        }

        @Override
        public void forgotPassword(String email) {
                var userOpt = repository.findByEmail(email);
                // Stay silent on an unknown email so this endpoint can't be used to enumerate registered accounts.
                if (userOpt.isEmpty()) {
                        return;
                }
                var user = userOpt.get();

                passwordResetTokenRepository.deleteByUser(user);

                String tokenPattern = UUID.randomUUID().toString();
                PasswordResetToken token = PasswordResetToken.builder()
                                .token(tokenPattern)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(1))
                                .build();

                passwordResetTokenRepository.save(token);

                String resetLink = frontendBaseUrl + "/reset-password?token=" + tokenPattern;
                // DEV STUB: no email provider is wired up yet, so log the link instead of sending it.
                // Swap this out for a real mail send before this goes anywhere near production.
                log.info("[DEV] Password reset link for {}: {}", email, resetLink);
        }

        @Override
        public void resetPassword(ResetPasswordRequest request) {
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

                if (resetToken.isExpired()) {
                        passwordResetTokenRepository.delete(resetToken);
                        throw new BadRequestException("Token has expired");
                }

                if (!request.newPassword().equals(request.confirmationPassword())) {
                        throw new BadRequestException("New password and confirmation password do not match");
                }

                User user = resetToken.getUser();
                user.setPassword(passwordEncoder.encode(request.newPassword()));
                repository.save(user);

                passwordResetTokenRepository.delete(resetToken);

                // A reset via emailed token implies the account may have been compromised - unlike a
                // self-service change-password, this signs every existing session out.
                refreshTokenService.revokeAllSessions(user);
        }
}
