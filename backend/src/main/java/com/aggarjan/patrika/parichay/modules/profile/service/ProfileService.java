package com.aggarjan.patrika.parichay.modules.profile.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSearchRequest;
import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import jakarta.validation.Valid;

import java.util.Map;

public interface ProfileService {
    BioData submitBioData(@Valid BioDataSubmissionRequest request, String userEmail);

    BioData getMyBioData(String email);

    BioData updateBioData(@Valid BioDataSubmissionRequest request, String email);

    BioData getBioDataById(Long id, String requesterEmail);

    Page<BioData> getAllBioData(Pageable pageable, String requesterEmail);

    Page<BioData> searchBioData(BioDataSearchRequest request, Pageable pageable, String requesterEmail);

    void activateProfile(String userEmail);

    BioData updateProfileStatus(Long bioDataId, Long statusId);

    Page<BioData> getAllBioDataByStatusId(Long statusId, Pageable pageable);

    BioData getAdminBioDataById(Long id);

    Map<String, Long> getProfileStats();
}
