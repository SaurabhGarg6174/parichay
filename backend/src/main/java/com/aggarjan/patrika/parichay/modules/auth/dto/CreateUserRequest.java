package com.aggarjan.patrika.parichay.modules.auth.dto;

import jakarta.validation.constraints.*;
import java.util.Set;

public record CreateUserRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Full Name is required")
    @Size(min = 3, max = 100, message = "Full Name must be between 3 and 100 characters")
    String fullName,

    Set<String> roles
) {}
