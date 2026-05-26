package com.aggarjan.patrika.parichay.modules.profile.repository;

import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BioDataRepo extends JpaRepository<BioData, Long>, JpaSpecificationExecutor<BioData> {

        long countByMembershipStatus_Name(String name);

        Optional<BioData> findByUser_Id(Long userId);

        Optional<BioData> findByUser_Email(String email);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_Name(String statusName,
                        org.springframework.data.domain.Pageable pageable);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_NameAndUser_EmailNot(String statusName,
                        String email,
                        org.springframework.data.domain.Pageable pageable);

        org.springframework.data.domain.Page<BioData> findAllByMembershipStatus_Id(Long statusId,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT b FROM BioData b JOIN b.user u WHERE b.membershipStatus.id = :statusId AND (LOWER(b.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
        org.springframework.data.domain.Page<BioData> searchByStatus(@org.springframework.data.repository.query.Param("statusId") Long statusId, @org.springframework.data.repository.query.Param("search") String search, org.springframework.data.domain.Pageable pageable);
}
