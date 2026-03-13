package com.aggarjan.patrika.parichay.modules.metadata.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import com.aggarjan.patrika.parichay.modules.metadata.repo.LookupRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metadata/lookups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LookupController {

    private final LookupRepo lookupRepo;

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<List<Lookup>>> getLookupsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(
                lookupRepo.findByCategoryAndActiveTrueOrderBySortOrderAscLabelAsc(category.toUpperCase()),
                "Lookups fetched successfully"
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<Lookup>>>> getAllLookups() {
        Map<String, List<Lookup>> lookups = lookupRepo.findByActiveTrueOrderByCategoryAscSortOrderAsc()
                .stream()
                .collect(Collectors.groupingBy(Lookup::getCategory));
        
        return ResponseEntity.ok(ApiResponse.success(lookups, "All lookups fetched successfully"));
    }
}
