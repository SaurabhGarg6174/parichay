package com.aggarjan.patrika.parichay.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;

public record PhotoRequestStatusUpdateRequest(
        @NotBlank(message = "Status is required") String status) {
}
