package com.aggarjan.patrika.parichay.modules.auth.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.auth.dto.*;
import com.aggarjan.patrika.parichay.modules.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.register(request), "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.authenticate(request), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return ResponseEntity.ok(ApiResponse.success(service.refreshToken(authHeader), "Token refreshed successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal) {
        service.changePassword(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success(service.getCurrentUser(principal.getName()), "User details fetched successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Since we are using stateless JWT, we cannot invalidate the token on server
        // side without a blacklist.
        // For now, we just instruct client to clear it.
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    // Placeholder for forgot password
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        // Implement email service logic here
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset link sent to email (Not implemented yet)"));
    }
}
