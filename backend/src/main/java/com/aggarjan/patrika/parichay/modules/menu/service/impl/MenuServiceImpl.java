package com.aggarjan.patrika.parichay.modules.menu.service.impl;

import com.aggarjan.patrika.parichay.modules.auth.service.UserService;
import com.aggarjan.patrika.parichay.modules.menu.model.Menu;
import com.aggarjan.patrika.parichay.modules.menu.repository.MenuRepository;
import com.aggarjan.patrika.parichay.modules.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    private final UserService userService;

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAllByOrderByOrderIndexAsc();
    }

    @Override
    public List<Menu> getMenusForUser(String email) {
        if (email == null) {
            return List.of();
        }

        var user = userService.getUserByEmailOrThrow(email);

        List<String> userRoles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toList());

        return menuRepository.findAllByOrderByOrderIndexAsc().stream()
                .filter(menu -> menu.getRoles().isEmpty() ||
                                menu.getRoles().stream().anyMatch(userRoles::contains))
                .collect(java.util.stream.Collectors.toList());
    }
}
