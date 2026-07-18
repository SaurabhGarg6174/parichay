package com.aggarjan.patrika.parichay.modules.metadata.service.impl;

import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import com.aggarjan.patrika.parichay.modules.metadata.repository.LookupRepo;
import com.aggarjan.patrika.parichay.modules.metadata.service.LookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LookupServiceImpl implements LookupService {

    private final LookupRepo lookupRepo;

    @Override
    public List<Lookup> getByCategory(String category) {
        return lookupRepo.findByCategoryAndActiveTrueOrderBySortOrderAscLabelAsc(category.toUpperCase());
    }

    @Override
    public Map<String, List<Lookup>> getAllGroupedByCategory() {
        return lookupRepo.findByActiveTrueOrderByCategoryAscSortOrderAsc()
                .stream()
                .collect(Collectors.groupingBy(Lookup::getCategory));
    }
}
