package com.aggarjan.patrika.parichay.modules.profile.service.impl;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repo.BioDataRepo;
import com.aggarjan.patrika.parichay.modules.profile.repo.MembershipStatusRepo;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

        private final com.aggarjan.patrika.parichay.modules.auth.repo.UserRepository userRepository;
        private final MembershipStatusRepo membershipStatusRepo;
        private final BioDataRepo bioDataRepo;

        @Override
        @Transactional
        public BioData submitBioData(BioDataSubmissionRequest request, String userEmail) {
                log.info("Received bio-data submission for: {}", request.fullName());

                var user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

                // Start: Refactored to prevent duplicate profiles
                if (bioDataRepo.findByUser_Email(userEmail).isPresent()) {
                        throw new BadRequestException("Profile already exists. Please use update instead.");
                }
                // End: Refactored

                MembershipStatus pendingStatus = membershipStatusRepo.findByName("PENDING")
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Initial status 'PENDING' not found in database"));

                BioData bioData = mapToBioData(request, user, pendingStatus);

                return bioDataRepo.save(bioData);
        }

        @Override
        public BioData getMyBioData(String email) {
                return bioDataRepo.findByUser_Email(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "BioData not found for user: " + email));
        }

        @Override
        @Transactional
        public BioData updateBioData(BioDataSubmissionRequest request, String email) {
                BioData existingBioData = bioDataRepo.findByUser_Email(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "BioData not found. Please submit first."));

                // Update fields
                updateBioDataFields(existingBioData, request);

                return bioDataRepo.save(existingBioData);
        }

        @Override
        public BioData getBioDataById(Long id) {
                return bioDataRepo.findById(id)
                                .map(bioData -> {
                                        // For public view, only show ACTIVE profiles.
                                        // In a real app, this logic would depend on who is calling (admin vs public).
                                        // For now, we restrict this improved getter to be "safe".
                                        // Note: If you want to view your OWN profile, use getMyBioData or check
                                        // ownership here.
                                        if (!"ACTIVE".equals(bioData.getMembershipStatus().getName())) {
                                                // Check security context if needed, but for simplicity:
                                                // Allow if it's just ID lookup? The requirement says "not visible to
                                                // anyone".
                                                // We will throw exception to hide it.
                                                throw new ResourceNotFoundException("BioData not found or not active.");
                                        }
                                        return bioData;
                                })
                                .orElseThrow(() -> new ResourceNotFoundException("BioData not found with id: " + id));
        }

        @Override
        public Page<BioData> getAllBioData(Pageable pageable) {
                // Filter by ACTIVE status
                return bioDataRepo.findAllByMembershipStatus_Name("ACTIVE", pageable);
        }

        @Override
        @Transactional
        public void activateProfile(String userEmail) {
                BioData bioData = bioDataRepo.findByUser_Email(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "BioData not found for user: " + userEmail));

                MembershipStatus activeStatus = membershipStatusRepo.findByName("ACTIVE")
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Status 'ACTIVE' not found"));

                bioData.setMembershipStatus(activeStatus);
                bioDataRepo.save(bioData);
        }

        @Override
        @Transactional
        public BioData updateProfileStatus(Long bioDataId, Long statusId) {
                BioData bioData = bioDataRepo.findById(bioDataId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "BioData not found with id: " + bioDataId));

                MembershipStatus status = membershipStatusRepo.findById(statusId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Status not found with id: " + statusId));

                bioData.setMembershipStatus(status);
                return bioDataRepo.save(bioData);
        }

        @Override
        public Page<BioData> getAllBioDataByStatusId(Long statusId, Pageable pageable) {
                return bioDataRepo.findAllByMembershipStatus_Id(statusId, pageable);
        }

        private BioData mapToBioData(BioDataSubmissionRequest request,
                        com.aggarjan.patrika.parichay.modules.auth.model.User user, MembershipStatus status) {
                return BioData.builder()
                                .user(user)
                                .fullName(request.fullName())
                                .dob(request.dob())
                                .birthTime(request.birthTime())
                                .birthPlace(request.birthPlace())
                                .complexion(request.complexion())
                                .height(request.height())
                                .weight(request.weight())
                                .education(request.education())
                                .occupation(request.occupation())
                                .monthlyIncome(request.monthlyIncome())
                                .gotra(request.gotra())
                                .isManglik(request.isManglik())
                                .wearsSpectacles(request.wearsSpectacles())
                                .fatherName(request.fatherName())
                                .fatherOccupation(request.fatherOccupation())
                                .brothersMarried(request.brothersMarried())
                                .brothersUnmarried(request.brothersUnmarried())
                                .sistersMarried(request.sistersMarried())
                                .sistersUnmarried(request.sistersUnmarried())
                                .membershipStatus(status)
                                .build();
        }

        private void updateBioDataFields(BioData bioData, BioDataSubmissionRequest request) {
                bioData.setFullName(request.fullName());
                bioData.setDob(request.dob());
                bioData.setBirthTime(request.birthTime());
                bioData.setBirthPlace(request.birthPlace());
                bioData.setComplexion(request.complexion());
                bioData.setHeight(request.height());
                bioData.setWeight(request.weight());
                bioData.setEducation(request.education());
                bioData.setOccupation(request.occupation());
                bioData.setMonthlyIncome(request.monthlyIncome());
                bioData.setGotra(request.gotra());
                bioData.setIsManglik(request.isManglik());
                bioData.setWearsSpectacles(request.wearsSpectacles());
                bioData.setFatherName(request.fatherName());
                bioData.setFatherOccupation(request.fatherOccupation());
                bioData.setBrothersMarried(request.brothersMarried());
                bioData.setBrothersUnmarried(request.brothersUnmarried());
                bioData.setSistersMarried(request.sistersMarried());
                bioData.setSistersUnmarried(request.sistersUnmarried());
        }
}