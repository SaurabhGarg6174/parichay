package com.aggarjan.patrika.parichay.modules.menu.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.menu.model.Menu;
import com.aggarjan.patrika.parichay.modules.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Menu>>> getMenus(java.security.Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                menuService.getMenusForUser(principal != null ? principal.getName() : null),
                "Menus fetched successfully"));
    }
}
