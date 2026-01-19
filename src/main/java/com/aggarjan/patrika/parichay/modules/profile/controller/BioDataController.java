package com.aggarjan.patrika.parichay.modules.profile.controller;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Update this for production security
public class BioDataController {
    private final ProfileService profileService;

    @PostMapping("/submit")
    public ResponseEntity<BioData> submitProfile(@Valid @RequestBody BioDataSubmissionRequest request) {
        BioData savedProfile = profileService.submitBioData(request);
        return new ResponseEntity<>(savedProfile, HttpStatus.CREATED);
    }
}
