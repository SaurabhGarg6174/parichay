package com.aggarjan.patrika.parichay.modules.profile.repo;

import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipStatusRepo extends JpaRepository<MembershipStatus, Long> {
    Optional<MembershipStatus> findByName(String name);
}
