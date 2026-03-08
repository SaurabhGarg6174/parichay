package com.aggarjan.patrika.parichay.modules.menu.component;

import com.aggarjan.patrika.parichay.modules.menu.model.Menu;
import com.aggarjan.patrika.parichay.modules.menu.model.SubMenu;
import com.aggarjan.patrika.parichay.modules.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MenuSeeder implements CommandLineRunner {

    private final MenuRepository menuRepository;

    @Override
    public void run(String... args) throws Exception {
        if (menuRepository.count() < 4) { // Re-seed if new menus are missing
            menuRepository.deleteAll();

            Menu dashboardMenu = Menu.builder()
                    .title("Dashboard")
                    .path("/dashboard")
                    .icon("Home")
                    .orderIndex(1)
                    .build();

            Menu profileMenu = Menu.builder()
                    .title("Profile Management")
                    .icon("User")
                    .orderIndex(2)
                    .build();

            profileMenu.addSubMenu(
                    SubMenu.builder().title("My Bio-Data").path("/dashboard/profile").orderIndex(1).build());
            profileMenu.addSubMenu(SubMenu.builder().title("Matches").path("/dashboard/matches").orderIndex(2).build());

            Menu paymentMenu = Menu.builder()
                    .title("Payment")
                    .icon("CreditCard")
                    .orderIndex(3)
                    .build();

            paymentMenu.addSubMenu(
                    SubMenu.builder().title("Activation Status").path("/dashboard/payment/activation").orderIndex(1)
                            .build());
            paymentMenu.addSubMenu(
                    SubMenu.builder().title("Memberships").path("/dashboard/payment/memberships").orderIndex(2)
                            .build());

            Menu settingsMenu = Menu.builder()
                    .title("Settings")
                    .path("/dashboard/settings")
                    .icon("Settings")
                    .orderIndex(4)
                    .build();

            menuRepository.saveAll(List.of(dashboardMenu, profileMenu, paymentMenu, settingsMenu));
        }
    }
}
