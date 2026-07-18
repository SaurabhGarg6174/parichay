package com.aggarjan.patrika.parichay.modules.metadata.repository;

import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LookupRepo extends JpaRepository<Lookup, Long> {
    List<Lookup> findByCategoryAndActiveTrueOrderBySortOrderAscLabelAsc(String category);
    List<Lookup> findByActiveTrueOrderByCategoryAscSortOrderAsc();
}
