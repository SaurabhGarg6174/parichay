package com.aggarjan.patrika.parichay.modules.profile.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record BioDataSubmissionRequest(
                @NotBlank(message = "Full Name is required")
                @Size(min = 3, max = 100, message = "Full Name must be between 3 and 100 characters")
                String fullName,
                String photoUrl,
                String gender,
                String maritalStatus,
                @NotBlank(message = "Contact Number is required")
                @Pattern(regexp = "^\\d{10}$", message = "Contact Number must be exactly 10 digits")
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
                Integer weight, // in kg
                Boolean wearsSpectacles,
                @NotBlank(message = "Gotra is required")
                @Size(min = 3, max = 50, message = "Gotra must be between 3 and 50 characters")
                String gotra,
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
                Integer sistersUnmarried,
                Boolean isPhotoHidden) {
}