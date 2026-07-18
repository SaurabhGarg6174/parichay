package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.modules.auth.model.User;

/**
 * Issues and validates the opaque, long-lived refresh tokens that back the short-lived JWT access token.
 * Tokens are stored hashed (never in plaintext) and are rotated on every use: presenting an
 * already-rotated/revoked token is treated as a possible theft signal and revokes every other
 * outstanding token for that user.
 */
public interface RefreshTokenService {

    record RotationResult(User user, String rawToken) {
    }

    String createToken(User user);

    RotationResult rotate(String rawToken);

    void revoke(String rawToken);

    /**
     * Revokes every outstanding refresh token for a user - used when a password reset implies the
     * account may have been compromised, so every existing session (attacker's included) is signed out.
     */
    void revokeAllSessions(User user);
}
