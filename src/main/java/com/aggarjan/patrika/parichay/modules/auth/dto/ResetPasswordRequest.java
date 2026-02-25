package com.aggarjan.patrika.parichay.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token cannot be empty") String token,

        @NotBlank(message = "Password cannot be empty") @Size(min = 6, message = "Password must be at least 6 characters") String newPassword,

        @NotBlank(message = "Confirmation password cannot be empty") String confirmationPassword) {
}
