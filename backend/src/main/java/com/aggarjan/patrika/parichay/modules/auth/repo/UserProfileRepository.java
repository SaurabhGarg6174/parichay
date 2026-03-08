package com.aggarjan.patrika.parichay.modules.auth.repo;

import com.aggarjan.patrika.parichay.modules.auth.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
}
