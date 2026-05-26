package com.aggarjan.patrika.parichay.modules.directory.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.directory.model.BusinessListing;
import com.aggarjan.patrika.parichay.modules.directory.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business-directory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BusinessController {
    private final BusinessService businessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusinessListing>>> getAllBusinessListings() {
        return ResponseEntity.ok(ApiResponse.success(
                businessService.getAllActiveListings(),
                "Business listings fetched successfully"));
    }

    @GetMapping("/random-ad")
    public ResponseEntity<ApiResponse<BusinessListing>> getRandomAd() {
        return ResponseEntity.ok(ApiResponse.success(
                businessService.getRandomListing(),
                "Random ad fetched successfully"));
    }

    @PostMapping("/admin/add")
    public ResponseEntity<ApiResponse<BusinessListing>> addBusinessListing(@RequestBody BusinessListing listing) {
        return ResponseEntity.ok(ApiResponse.success(
                businessService.saveListing(listing),
                "Business listing added successfully"));
    }
}
