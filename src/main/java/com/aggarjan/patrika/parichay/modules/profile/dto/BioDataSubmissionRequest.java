package com.aggarjan.patrika.parichay.modules.profile.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record BioDataSubmissionRequest(
        @NotBlank String fullName,
        @NotNull LocalDate dob,
        String birthTime,
        String birthPlace,
        String complexion,
        String height,
        String weight,
        Boolean wearsSpectacles,
        @NotBlank String gotra,
        Boolean isManglik,
        String education,
        String occupation,
        Double monthlyIncome,
        String fatherName,
        String fatherOccupation,
        Integer brothersMarried,
        Integer brothersUnmarried,
        Integer sistersMarried,
        Integer sistersUnmarried
) {
}