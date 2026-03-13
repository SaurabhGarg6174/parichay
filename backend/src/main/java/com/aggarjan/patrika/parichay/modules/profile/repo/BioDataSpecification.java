package com.aggarjan.patrika.parichay.modules.profile.repo;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSearchRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class BioDataSpecification {

    private BioDataSpecification() {
    }

    public static Specification<BioData> buildSearchSpec(BioDataSearchRequest request, String excludeEmail) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by ACTIVE status
            predicates.add(cb.equal(root.get("membershipStatus").get("name"), "ACTIVE"));

            // Exclude the requester's own profile
            if (excludeEmail != null) {
                predicates.add(cb.notEqual(root.get("user").get("email"), excludeEmail));
            }

            if (request == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            // Name — partial match (case-insensitive)
            if (request.name() != null && !request.name().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("fullName")),
                        "%" + request.name().toLowerCase() + "%"));
            }

            // Gotra — exact match (case-insensitive)
            if (request.gotra() != null && !request.gotra().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("gotra")),
                        request.gotra().toLowerCase()));
            }

            // Gender — exact match
            if (request.gender() != null && !request.gender().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("gender")),
                        request.gender().toLowerCase()));
            }

            // Age range — convert to DOB range
            if (request.minAge() != null) {
                LocalDate maxDob = LocalDate.now().minusYears(request.minAge());
                predicates.add(cb.lessThanOrEqualTo(root.get("dob"), maxDob));
            }
            if (request.maxAge() != null) {
                LocalDate minDob = LocalDate.now().minusYears(request.maxAge() + 1).plusDays(1);
                predicates.add(cb.greaterThanOrEqualTo(root.get("dob"), minDob));
            }

            // Education — partial match (case-insensitive)
            if (request.education() != null && !request.education().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("education")),
                        "%" + request.education().toLowerCase() + "%"));
            }

            // City — partial match (case-insensitive)
            if (request.city() != null && !request.city().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("familyCity")),
                        "%" + request.city().toLowerCase() + "%"));
            }

            // Manglik status — exact match (case-insensitive)
            if (request.isManglik() != null && !request.isManglik().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("isManglik")),
                        request.isManglik().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
