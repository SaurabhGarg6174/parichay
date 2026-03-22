package com.aggarjan.patrika.parichay.modules.admin.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.core.payload.PagedResponse;
import com.aggarjan.patrika.parichay.modules.metadata.service.ActionService;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aggarjan.patrika.parichay.modules.auth.dto.CreateUserRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.UserDto;
import com.aggarjan.patrika.parichay.modules.auth.service.UserService;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final ProfileService profileService;
    private final UserService userService;
    private final ActionService actionService;

    @GetMapping("/profiles")
    public ResponseEntity<ApiResponse<PagedResponse<BioData>>> getProfilesByStatus(
            @RequestParam Long statusId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<BioData> profiles = profileService.getAllBioDataByStatusId(statusId, search, pageable);
        // ... filter by search if present
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(profiles, actionService.getActionsByModuleAndStatus("ADMIN_PROFILES", statusId)),
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

    @PutMapping("/profiles/{profileId}/verify/{verified}")
    public ResponseEntity<ApiResponse<BioData>> updateProfileVerification(
            @PathVariable Long profileId,
            @PathVariable boolean verified) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateVerificationStatus(profileId, verified),
                "Profile verification status updated successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "true") boolean enabled,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UserDto> users = userService.getAllUsersByStatus(enabled, pageable);
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(users, actionService.getActionsByModuleAndStatus("ADMIN_USERS", null)),
                "Users fetched successfully"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.createUser(request),
                "User created successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PutMapping("/users/{userId}/status/{active}")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long userId,
            @PathVariable boolean active) {
        userService.updateUserStatus(userId, active);
        return ResponseEntity.ok(ApiResponse.success(null, "User status updated successfully"));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long userId,
            @RequestBody UserDto userDto) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUser(userId, userDto),
                "User updated successfully"));
    }
}

