package com.aggarjan.patrika.parichay.modules.menu.service;

import com.aggarjan.patrika.parichay.modules.menu.model.Menu;
import com.aggarjan.patrika.parichay.modules.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    private final com.aggarjan.patrika.parichay.modules.auth.repo.UserRepository userRepository;

    public List<Menu> getAllMenus() {
        return menuRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<Menu> getMenusForUser(String email) {
        if (email == null) {
            return List.of();
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> userRoles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toList());

        return menuRepository.findAllByOrderByOrderIndexAsc().stream()
                .filter(menu -> menu.getRoles().isEmpty() || 
                                menu.getRoles().stream().anyMatch(userRoles::contains))
                .collect(java.util.stream.Collectors.toList());
    }
}
