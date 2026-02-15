package com.aggarjan.patrika.parichay.core.config;

import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.repo.RoleRepository;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repo.MembershipStatusRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, MembershipStatusRepo membershipStatusRepo) {
        return args -> {
            List<String> roles = List.of("USER", "ADMIN");
            roles.forEach(roleName -> {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(Role.builder().name(roleName).description("Default role").build());
                }
            });

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
        };
    }
}
