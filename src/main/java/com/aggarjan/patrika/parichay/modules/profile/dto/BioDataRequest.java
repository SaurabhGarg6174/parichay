package com.aggarjan.patrika.parichay.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BioDataRequest(
        @NotBlank(message = "Name cannot be empty") String fullName,
        @NotNull(message = "DOB is required") LocalDate dob,
        @NotBlank String gotra
) {}