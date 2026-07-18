package com.aggarjan.patrika.parichay.modules.metadata.repository;

import com.aggarjan.patrika.parichay.modules.metadata.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepo extends JpaRepository<Action, Long> {
    List<Action> findByTargetModuleAndTargetStatusIdAndActiveTrueOrderBySortOrderAsc(String targetModule, Long targetStatusId);
    List<Action> findByTargetModuleAndActiveTrueOrderBySortOrderAsc(String targetModule);
}
