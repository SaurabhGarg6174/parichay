package com.aggarjan.patrika.parichay.modules.profile.controller;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSearchRequest;
import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.core.payload.PagedResponse;
import com.aggarjan.patrika.parichay.modules.metadata.service.ActionService;
import com.aggarjan.patrika.parichay.modules.profile.model.PhotoRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.SuccessStory;
import com.aggarjan.patrika.parichay.modules.profile.service.QrCodeService;
import com.aggarjan.patrika.parichay.modules.profile.service.PdfService;
import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BioDataController {
        private final ProfileService profileService;
        private final ActionService actionService;
        private final PdfService pdfService;
        private final QrCodeService qrCodeService;

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

        @GetMapping("/{id}/download-pdf")
        public ResponseEntity<InputStreamResource> downloadBioDataPdf(@PathVariable Long id, java.security.Principal principal) {
                BioData bioData = profileService.getBioDataById(id, principal != null ? principal.getName() : null);
                ByteArrayInputStream bis = pdfService.generateBioDataPdf(bioData);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "inline; filename=BioData_" + bioData.getFullName().replace(" ", "_") + ".pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @PostMapping("/{id}/request-photo")
        public ResponseEntity<ApiResponse<PhotoRequest>> requestPhoto(@PathVariable Long id, java.security.Principal principal) {
                return ResponseEntity.ok(ApiResponse.success(
                                profileService.requestPhotoAccess(id, principal.getName()),
                                "Photo access requested successfully"));
        }

        @GetMapping("/photo-requests")
        public ResponseEntity<ApiResponse<List<PhotoRequest>>> getPhotoRequests(java.security.Principal principal) {
                return ResponseEntity.ok(ApiResponse.success(
                                profileService.getIncomingPhotoRequests(principal.getName()),
                                "Incoming photo requests fetched successfully"));
        }

        @PutMapping("/photo-requests/{requestId}/respond/{status}")
        public ResponseEntity<ApiResponse<PhotoRequest>> respondToPhotoRequest(
                        @PathVariable Long requestId,
                        @PathVariable String status) {
                return ResponseEntity.ok(ApiResponse.success(
                                profileService.respondToPhotoRequest(requestId, status),
                                "Photo request responded successfully"));
        }

        @GetMapping(value = "/{id}/qr-code", produces = MediaType.IMAGE_PNG_VALUE)
        public ResponseEntity<byte[]> getProfileQrCode(@PathVariable Long id) throws IOException {
                String profileUrl = "https://patrika-parichay.aggarjan.com/dashboard/matches/" + id;
                byte[] qrCode = qrCodeService.generateQrCode(profileUrl, 300, 300);
                return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_PNG)
                                .body(qrCode);
        }

        @GetMapping("/success-stories")
        public ResponseEntity<ApiResponse<List<SuccessStory>>> getSuccessStories() {
                return ResponseEntity.ok(ApiResponse.success(profileService.getAllSuccessStories(),
                                "Success stories fetched successfully"));
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
}
