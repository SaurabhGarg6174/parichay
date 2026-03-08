package com.aggarjan.patrika.parichay.modules.menu.repository;

import com.aggarjan.patrika.parichay.modules.menu.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findAllByOrderByOrderIndexAsc();
}
