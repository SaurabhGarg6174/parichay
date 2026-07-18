package com.aggarjan.patrika.parichay.modules.auth.repository;

import com.aggarjan.patrika.parichay.modules.auth.model.PasswordResetToken;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(User user);

    void deleteByUser(User user);
}
