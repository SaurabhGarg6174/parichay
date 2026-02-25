package com.aggarjan.patrika.parichay.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordManagementRequest(
        @NotBlank(message = "Action is required (FORGOT, RESET, CHANGE)") String action,

        String email,
        String token,
        String currentPassword,
        String newPassword,
        String confirmationPassword) {
}
