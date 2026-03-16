package com.aggarjan.patrika.parichay.modules.profile.controller;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSearchRequest;
import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.core.payload.PagedResponse;
import com.aggarjan.patrika.parichay.modules.metadata.service.ActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BioDataController {
        private final ProfileService profileService;
        private final ActionService actionService;

        @PostMapping
        public ResponseEntity<ApiResponse<BioData>> createProfile(
                        @Valid @RequestBody BioDataSubmissionRequest request,
                        java.security.Principal principal) {
                BioData savedProfile = profileService.submitBioData(request, principal.getName());
                return new ResponseEntity<>(ApiResponse.success(savedProfile, "Profile submitted successfully"),
                                HttpStatus.CREATED);
        }

        @GetMapping("/me")
        public ResponseEntity<ApiResponse<BioData>> getMyProfile(java.security.Principal principal) {
                return ResponseEntity.ok(
                                ApiResponse.success(profileService.getMyBioData(principal.getName()),
                                                "Profile fetched successfully"));
        }

        @PutMapping("/me")
        public ResponseEntity<ApiResponse<BioData>> updateMyProfile(
                        @Valid @RequestBody BioDataSubmissionRequest request,
                        java.security.Principal principal) {
                return ResponseEntity.ok(ApiResponse.success(profileService.updateBioData(request, principal.getName()),
                                "Profile updated successfully"));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<BioData>> getProfileById(@PathVariable Long id,
                        java.security.Principal principal) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                profileService.getBioDataById(id,
                                                                principal != null ? principal.getName() : null),
                                                "Profile fetched successfully"));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<PagedResponse<BioData>>> getAllProfiles(
                        @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
                        java.security.Principal principal) {
                Page<BioData> profiles = profileService.getAllBioData(pageable,
                                principal != null ? principal.getName() : null);
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                PagedResponse.from(profiles, actionService.getActionsByModuleAndStatus("USER_PROFILES", null)),
                                                "Profiles fetched successfully"));
        }

        @GetMapping("/search")
        public ResponseEntity<ApiResponse<PagedResponse<BioData>>> searchProfiles(
                        BioDataSearchRequest request,
                        @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
                        java.security.Principal principal) {
                Page<BioData> profiles = profileService.searchBioData(request, pageable,
                                principal != null ? principal.getName() : null);
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                PagedResponse.from(profiles, actionService.getActionsByModuleAndStatus("USER_PROFILES", null)),
                                                "Profiles searched successfully"));
        }
}

