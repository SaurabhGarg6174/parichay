package com.aggarjan.patrika.parichay.modules.profile.service.impl;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repo.BioDataRepo;
import com.aggarjan.patrika.parichay.modules.profile.repo.MembershipStatusRepo;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final MembershipStatusRepo membershipStatusRepo;
    private final BioDataRepo bioDataRepo;

    @Override
    @Transactional
    public BioData submitBioData(BioDataSubmissionRequest request) {
        log.info("Received bio-data submission for: {}", request.fullName());

        MembershipStatus pendingStatus = membershipStatusRepo.findByName("PENDING").orElseThrow(() -> new RuntimeException("Initial status 'PENDING' not found in database"));

        BioData bioData = BioData.builder().fullName(request.fullName()).dob(request.dob()).birthTime(request.birthTime()).birthPlace(request.birthPlace()).complexion(request.complexion()).height(request.height()).weight(request.weight()).education(request.education()).occupation(request.occupation()).monthlyIncome(request.monthlyIncome()).gotra(request.gotra()).isManglik(request.isManglik()).membershipStatus(pendingStatus).build();

        return bioDataRepo.save(bioData);
    }
}