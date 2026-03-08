package com.aggarjan.patrika.parichay.modules.profile.repo;

import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BioDataRepo extends JpaRepository<BioData, Long> {
        Optional<BioData> findByUser_Id(Long userId);

        Optional<BioData> findByUser_Email(String email);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_Name(String statusName,
                        org.springframework.data.domain.Pageable pageable);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_NameAndUser_EmailNot(String statusName,
                        String email,
                        org.springframework.data.domain.Pageable pageable);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_Id(Long statusId,
                        org.springframework.data.domain.Pageable pageable);
}
