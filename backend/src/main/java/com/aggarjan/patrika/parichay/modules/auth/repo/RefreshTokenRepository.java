package com.aggarjan.patrika.parichay.modules.auth.repo;

import com.aggarjan.patrika.parichay.modules.auth.model.RefreshToken;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUserAndRevokedFalse(User user);
}
