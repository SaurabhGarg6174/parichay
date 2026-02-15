package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.core.security.JwtService;
import com.aggarjan.patrika.parichay.modules.auth.dto.*;
import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.model.UserProfile;
import com.aggarjan.patrika.parichay.modules.auth.repo.RoleRepository;
import com.aggarjan.patrika.parichay.modules.auth.repo.UserRepository;
import com.aggarjan.patrika.parichay.modules.auth.repo.UserProfileRepository;
import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.core.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {
        private final UserRepository repository;
        private final RoleRepository roleRepository;
        private final UserProfileRepository userProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

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

                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.email(),
                                                request.password()));
                var user = repository.findByEmail(request.email())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + request.email()));

                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

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
                                roles);
        }

        public AuthenticationResponse refreshToken(String authHeader) {
                final String refreshToken;
                final String userEmail;
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new BadRequestException("Refresh token is missing or invalid");
                }
                refreshToken = authHeader.substring(7);
                userEmail = jwtService.extractUsername(refreshToken);
                if (userEmail != null) {
                        var user = this.repository.findByEmail(userEmail)
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        if (jwtService.isTokenValid(refreshToken, user)) {
                                var accessToken = jwtService.generateToken(user);
                                return AuthenticationResponse.builder()
                                                .token(accessToken)
                                                .build();
                        }
                }
                throw new BadRequestException("Invalid refresh token");
        }
}
