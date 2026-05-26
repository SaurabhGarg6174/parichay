package com.aggarjan.patrika.parichay.modules.profile.repository;

import com.aggarjan.patrika.parichay.modules.profile.model.PhotoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoRequestRepo extends JpaRepository<PhotoRequest, Long> {
    Optional<PhotoRequest> findByRequesterEmailAndTargetBioDataId(String email, Long targetId);
    List<PhotoRequest> findAllByTargetBioDataIdOrderByCreatedAtDesc(Long targetId);
    List<PhotoRequest> findAllByRequesterEmailOrderByCreatedAtDesc(String email);
}
