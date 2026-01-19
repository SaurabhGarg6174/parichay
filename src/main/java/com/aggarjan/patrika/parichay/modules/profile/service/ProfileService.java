package com.aggarjan.patrika.parichay.modules.profile.service;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import jakarta.validation.Valid;

public interface ProfileService {
    BioData submitBioData(@Valid BioDataSubmissionRequest request);
}
