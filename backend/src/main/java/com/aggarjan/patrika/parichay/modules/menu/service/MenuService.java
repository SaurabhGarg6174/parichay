package com.aggarjan.patrika.parichay.modules.menu.service;

import com.aggarjan.patrika.parichay.modules.menu.model.Menu;

import java.util.List;

public interface MenuService {
    List<Menu> getAllMenus();

    List<Menu> getMenusForUser(String email);
}
