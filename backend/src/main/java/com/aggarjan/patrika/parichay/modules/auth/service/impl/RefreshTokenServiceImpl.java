package com.aggarjan.patrika.parichay.modules.auth.service.impl;

import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.modules.auth.model.RefreshToken;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.repository.RefreshTokenRepository;
import com.aggarjan.patrika.parichay.modules.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${application.security.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public String createToken(User user) {
        String rawToken = generateOpaqueToken();
        RefreshToken entity = RefreshToken.builder()
                .tokenHash(hash(rawToken))
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    @Override
    @Transactional
    public RotationResult rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (existing.isRevoked()) {
            log.warn("Refresh token reuse detected for user {}; revoking all active sessions", existing.getUser().getEmail());
            revokeAllForUser(existing.getUser());
            throw new BadRequestException("This refresh token has already been used. All sessions have been signed out for safety - please log in again.");
        }

        if (existing.isExpired()) {
            throw new BadRequestException("Refresh token has expired. Please log in again.");
        }

        User user = existing.getUser();
        if (!user.isEnabled() || !user.isAccountNonLocked()) {
            // Account was disabled or locked after this token was issued - kill every session for it, not just this one.
            revokeAllForUser(user);
            throw new BadRequestException("This account is no longer active. Please log in again.");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        return new RotationResult(user, createToken(user));
    }

    @Override
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(t -> {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                });
    }

    @Override
    @Transactional
    public void revokeAllSessions(User user) {
        revokeAllForUser(user);
    }

    private void revokeAllForUser(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserAndRevokedFalse(user);
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    private String generateOpaqueToken() {
        byte[] randomBytes = new byte[64];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
