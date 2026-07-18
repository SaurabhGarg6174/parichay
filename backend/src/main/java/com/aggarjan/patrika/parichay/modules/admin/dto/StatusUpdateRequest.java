package com.aggarjan.patrika.parichay.modules.admin.dto;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull(message = "Status ID is required") Long statusId) {
}
