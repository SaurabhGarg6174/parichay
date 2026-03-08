package com.aggarjan.patrika.parichay.modules.profile.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record BioDataSubmissionRequest(
                @NotBlank String fullName,
                String photoUrl,
                String gender,
                String maritalStatus,
                String contactNumber,
                @NotNull LocalDate dob,
                String birthTime,
                String birthPlace,
                String familyAddress,
                String familyCity,
                String familyState,
                String familyCountry,
                String complexion,
                String height,
                String weight,
                Boolean wearsSpectacles,
                @NotBlank String gotra,
                String isManglik,
                String education,
                String occupation,
                Double monthlyIncome,
                String fatherName,
                String fatherOccupation,
                String motherName,
                String motherOccupation,
                Integer brothersMarried,
                Integer brothersUnmarried,
                Integer sistersMarried,
                Integer sistersUnmarried) {
}