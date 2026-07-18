package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.modules.auth.model.RefreshToken;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.repo.RefreshTokenRepository;
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

/**
 * Issues and validates the opaque, long-lived refresh tokens that back the short-lived JWT access token.
 * Tokens are stored hashed (never in plaintext) and are rotated on every use: presenting an
 * already-rotated/revoked token is treated as a possible theft signal and revokes every other
 * outstanding token for that user.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${application.security.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    public record RotationResult(User user, String rawToken) {
    }

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

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        User user = existing.getUser();
        return new RotationResult(user, createToken(user));
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(t -> {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                });
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
