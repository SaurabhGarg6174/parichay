package com.aggarjan.patrika.parichay.modules.menu.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menus")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String path;

    private String icon;

    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<SubMenu> subMenus = new ArrayList<>();

    public void addSubMenu(SubMenu subMenu) {
        subMenus.add(subMenu);
        subMenu.setMenu(this);
    }
}
