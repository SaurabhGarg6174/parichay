package com.aggarjan.patrika.parichay.core.config;

import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.repo.RoleRepository;
import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import com.aggarjan.patrika.parichay.modules.metadata.repo.LookupRepo;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repo.MembershipStatusRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            RoleRepository roleRepository,
            MembershipStatusRepo membershipStatusRepo,
            LookupRepo lookupRepo) {
        return args -> {
            // Roles
            List<String> roles = List.of("USER", "ADMIN");
            roles.forEach(roleName -> {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(Role.builder().name(roleName).description("Default role").build());
                }
            });

            // Membership Statuses
            List<String> statuses = List.of("PENDING", "APPROVED", "REJECTED", "ACTIVE", "INACTIVE",
                    "PAYMENT_VERIFIED");
            statuses.forEach(status -> {
                if (membershipStatusRepo.findByName(status).isEmpty()) {
                    MembershipStatus ms = new MembershipStatus();
                    ms.setName(status);
                    ms.setDescription("Membership status " + status);
                    membershipStatusRepo.save(ms);
                }
            });

            // Metadata Lookups
            Map<String, List<String>> lookupData = Map.of(
                "GOTRA", List.of(
                    "Bansal", "Garg", "Goyal", "Gupta", "Jindal", "Kansal",
                    "Mittal", "Mangal", "Singhal", "Tayal", "Bindal", "Dharan",
                    "Airan", "Kuchhal", "Bhandal", "Tingal", "Nagal", "Madhukul"
                ),
                "MARITAL_STATUS", List.of("Never Married", "Divorced", "Widowed", "Awaiting Divorce"),
                "GENDER", List.of("Male", "Female"),
                "MANGLIK_STATUS", List.of("No", "Yes", "Anshik"),
                "EDUCATION", List.of("B.Tech", "M.Tech", "MBA", "MBBS", "CA", "CS", "PhD", "B.Com", "M.Com", "BCA", "MCA", "Other"),
                "OCCUPATION", List.of("Service - Private", "Service - Government", "Business", "Self Employed", "Professional", "Not Working", "Other")
            );

            lookupData.forEach((category, labels) -> {
                for (int i = 0; i < labels.size(); i++) {
                    String label = labels.get(i);
                    String value = label.toUpperCase().replace(" ", "_").replace("-", "_");
                    if (lookupRepo.findByCategoryAndActiveTrueOrderBySortOrderAscLabelAsc(category).stream()
                            .noneMatch(l -> l.getLabel().equalsIgnoreCase(label))) {
                        lookupRepo.save(Lookup.builder()
                                .category(category)
                                .label(label)
                                .value(value)
                                .sortOrder(i + 1)
                                .active(true)
                                .build());
                    }
                }
            });
        };
    }
}

