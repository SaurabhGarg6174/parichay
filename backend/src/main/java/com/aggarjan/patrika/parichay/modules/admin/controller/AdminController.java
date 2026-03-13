package com.aggarjan.patrika.parichay.modules.admin.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProfileService profileService;

    @GetMapping("/profiles")
    public ResponseEntity<ApiResponse<Page<BioData>>> getProfilesByStatus(
            @RequestParam Long statusId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getAllBioDataByStatusId(statusId, pageable),
                "Profiles fetched successfully"));
    }

    @GetMapping("/profiles/{profileId}")
    public ResponseEntity<ApiResponse<BioData>> getProfileById(@PathVariable Long profileId) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getAdminBioDataById(profileId),
                "Profile fetched successfully"));
    }

    @PutMapping("/profiles/{profileId}/status/{statusId}")
    public ResponseEntity<ApiResponse<BioData>> updateProfileStatus(
            @PathVariable Long profileId,
            @PathVariable Long statusId) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateProfileStatus(profileId, statusId),
                "Profile status updated successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getProfileStats() {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getProfileStats(),
                "Stats fetched successfully"));
    }
}

