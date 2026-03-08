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

    public List<Menu> getAllMenus() {
        return menuRepository.findAllByOrderByOrderIndexAsc();
    }
}
