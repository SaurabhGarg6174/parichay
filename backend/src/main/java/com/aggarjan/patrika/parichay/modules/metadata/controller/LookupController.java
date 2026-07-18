package com.aggarjan.patrika.parichay.modules.metadata.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.metadata.model.Lookup;
import com.aggarjan.patrika.parichay.modules.metadata.service.LookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/metadata/lookups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LookupController {

    private final LookupService lookupService;

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<List<Lookup>>> getLookupsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(
                lookupService.getByCategory(category),
                "Lookups fetched successfully"
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<Lookup>>>> getAllLookups() {
        return ResponseEntity.ok(ApiResponse.success(lookupService.getAllGroupedByCategory(), "All lookups fetched successfully"));
    }
}
