package com.aggarjan.patrika.parichay.core.config;

import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.repository.RoleRepository;
import com.aggarjan.patrika.parichay.modules.metadata.model.Action;
import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import com.aggarjan.patrika.parichay.modules.metadata.repository.ActionRepo;
import com.aggarjan.patrika.parichay.modules.metadata.repository.LookupRepo;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repository.MembershipStatusRepo;
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
            LookupRepo lookupRepo,
            ActionRepo actionRepo) {
        return args -> {
            // Roles
            List<String> roles = List.of("USER", "ADMIN");
            roles.forEach(roleName -> {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(Role.builder().name(roleName).description("Default role").build());
                }
            });

            // Membership Statuses
            List<String> statuses = List.of("PENDING", "ACTIVE", "INACTIVE");
            statuses.forEach(status -> {
                if (membershipStatusRepo.findByName(status).isEmpty()) {
                    MembershipStatus ms = new MembershipStatus();
                    ms.setName(status);
                    ms.setDescription("Membership status " + status);
                    membershipStatusRepo.save(ms);
                }
            });

            // Retrieve status entities to obtain their database IDs
            MembershipStatus pendingStatus = membershipStatusRepo.findByName("PENDING")
                    .orElseThrow(() -> new IllegalStateException("PENDING status not found"));
            MembershipStatus activeStatus = membershipStatusRepo.findByName("ACTIVE")
                    .orElseThrow(() -> new IllegalStateException("ACTIVE status not found"));
            MembershipStatus inactiveStatus = membershipStatusRepo.findByName("INACTIVE")
                    .orElseThrow(() -> new IllegalStateException("INACTIVE status not found"));

            Long pendingId = pendingStatus.getId();
            Long activeId = activeStatus.getId();
            Long inactiveId = inactiveStatus.getId();

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

            // Clear actions first to prevent old/duplicate records
            actionRepo.deleteAll();

            // Actions for Admin Profiles
            seedProfileAction(actionRepo, "View", "VIEW", "Eye", "text-gray-500", "ADMIN_PROFILES", null, 1);
            
            // Pending Status Actions: VIEW, ACTIVATE
            seedProfileAction(actionRepo, "Activate", "ACTIVATE", "Play", "text-indigo-600", "ADMIN_PROFILES", pendingId, 2);

            // Active Status Actions: VIEW, DEACTIVATE
            seedProfileAction(actionRepo, "Deactivate", "DEACTIVATE", "X", "text-rose-600", "ADMIN_PROFILES", activeId, 2);

            // Inactive Status Actions: VIEW, REACTIVATE
            seedProfileAction(actionRepo, "Activate", "REACTIVATE", "Play", "text-indigo-600", "ADMIN_PROFILES", inactiveId, 2);
            
            // Seed Actions for User Profiles
            seedProfileAction(actionRepo, "View Profile", "VIEW_USER", "User", "text-indigo-600", "USER_PROFILES", null, 1);
            seedProfileAction(actionRepo, "Shortlist", "SHORTLIST", "Heart", "text-rose-500", "USER_PROFILES", null, 2);

            // Admin Users (for full table, not status specific)
            seedProfileAction(actionRepo, "Edit", "EDIT", "Pencil", "text-indigo-600", "ADMIN_USERS", null, 1);
            seedProfileAction(actionRepo, "Delete", "DELETE", "Trash", "text-rose-600", "ADMIN_USERS", null, 2);
        };
    }

    private void seedProfileAction(ActionRepo repo, String label, String code, String icon, String color, String module, Long statusId, int order) {
        if (repo.findByTargetModuleAndActiveTrueOrderBySortOrderAsc(module).stream()
                .noneMatch(a -> a.getCode().equals(code) && (statusId == null || statusId.equals(a.getTargetStatusId())))) {
            repo.save(Action.builder()
                    .label(label)
                    .code(code)
                    .icon(icon)
                    .color(color)
                    .targetModule(module)
                    .targetStatusId(statusId)
                    .sortOrder(order)
                    .active(true)
                    .build());
        }
    }
}

