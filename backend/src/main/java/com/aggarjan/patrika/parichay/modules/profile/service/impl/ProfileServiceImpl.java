package com.aggarjan.patrika.parichay.modules.profile.service.impl;

import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSearchRequest;
import com.aggarjan.patrika.parichay.modules.profile.dto.BioDataSubmissionRequest;
import com.aggarjan.patrika.parichay.modules.profile.model.BioData;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repo.BioDataRepo;
import com.aggarjan.patrika.parichay.modules.profile.repo.BioDataSpecification;
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
        public BioData getBioDataById(Long id, String requesterEmail) {
                return bioDataRepo.findById(id)
                                .map(bioData -> {
                                        // For public view, only show ACTIVE profiles.
                                        if (!"ACTIVE".equals(bioData.getMembershipStatus().getName())) {
                                                throw new ResourceNotFoundException("BioData not found or not active.");
                                        }
                                        return maskBioDataIfNotActive(bioData, requesterEmail);
                                })
                                .orElseThrow(() -> new ResourceNotFoundException("BioData not found with id: " + id));
        }

        @Override
        public Page<BioData> getAllBioData(Pageable pageable, String requesterEmail) {
                // Filter by ACTIVE status
                if (requesterEmail != null) {
                        return bioDataRepo
                                        .findAllByMembershipStatus_NameAndUser_EmailNot("ACTIVE", requesterEmail,
                                                        pageable)
                                        .map(bioData -> maskBioDataIfNotActive(bioData, requesterEmail));
                }
                return bioDataRepo.findAllByMembershipStatus_Name("ACTIVE", pageable)
                                .map(bioData -> maskBioDataIfNotActive(bioData, requesterEmail));
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

        @Override
        public Page<BioData> searchBioData(BioDataSearchRequest request, Pageable pageable, String requesterEmail) {
                var spec = BioDataSpecification.buildSearchSpec(request, requesterEmail);
                return bioDataRepo.findAll(spec, pageable)
                                .map(bioData -> maskBioDataIfNotActive(bioData, requesterEmail));
        }

        @Override
        public BioData getAdminBioDataById(Long id) {
                return bioDataRepo.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("BioData not found with id: " + id));
        }

        @Override
        public java.util.Map<String, Long> getProfileStats() {
                java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
                stats.put("PENDING", bioDataRepo.countByMembershipStatus_Name("PENDING"));
                stats.put("APPROVED", bioDataRepo.countByMembershipStatus_Name("APPROVED"));
                stats.put("REJECTED", bioDataRepo.countByMembershipStatus_Name("REJECTED"));
                stats.put("ACTIVE", bioDataRepo.countByMembershipStatus_Name("ACTIVE"));
                return stats;
        }


        private BioData mapToBioData(BioDataSubmissionRequest request,
                        com.aggarjan.patrika.parichay.modules.auth.model.User user, MembershipStatus status) {
                return BioData.builder()
                                .user(user)
                                .fullName(request.fullName())
                                .photoUrl(request.photoUrl())
                                .gender(request.gender())
                                .maritalStatus(request.maritalStatus())
                                .contactNumber(request.contactNumber())
                                .dob(request.dob())
                                .birthTime(request.birthTime())
                                .birthPlace(request.birthPlace())
                                .familyAddress(request.familyAddress())
                                .familyCity(request.familyCity())
                                .familyState(request.familyState())
                                .familyCountry(request.familyCountry())
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
                                .motherName(request.motherName())
                                .motherOccupation(request.motherOccupation())
                                .brothersMarried(request.brothersMarried())
                                .brothersUnmarried(request.brothersUnmarried())
                                .sistersMarried(request.sistersMarried())
                                .sistersUnmarried(request.sistersUnmarried())
                                .membershipStatus(status)
                                .build();
        }

        private BioData maskBioDataIfNotActive(BioData bioData, String requesterEmail) {
                boolean isActiveMember = false;
                if (requesterEmail != null) {
                        var requesterBioDataOpt = bioDataRepo.findByUser_Email(requesterEmail);
                        if (requesterBioDataOpt.isPresent()
                                        && "ACTIVE".equals(requesterBioDataOpt.get().getMembershipStatus().getName())) {
                                isActiveMember = true;
                        }
                }

                if (isActiveMember) {
                        return bioData;
                }

                return BioData.builder()
                                .id(bioData.getId())
                                .fullName(bioData.getFullName())
                                .photoUrl(bioData.getPhotoUrl())
                                .gender(bioData.getGender())
                                .maritalStatus(bioData.getMaritalStatus())
                                .contactNumber("Unlock to view") // MASKED
                                .dob(bioData.getDob())
                                .birthTime(bioData.getBirthTime())
                                .birthPlace(bioData.getBirthPlace())
                                .familyAddress("Unlock to view") // MASKED
                                .familyCity(bioData.getFamilyCity())
                                .familyState(bioData.getFamilyState())
                                .familyCountry(bioData.getFamilyCountry())
                                .complexion(bioData.getComplexion())
                                .height(bioData.getHeight())
                                .weight(bioData.getWeight())
                                .education(bioData.getEducation())
                                .occupation(bioData.getOccupation())
                                .monthlyIncome(bioData.getMonthlyIncome())
                                .gotra(bioData.getGotra())
                                .isManglik(bioData.getIsManglik())
                                .wearsSpectacles(bioData.getWearsSpectacles())
                                .fatherName("Unlock to view") // MASKED
                                .fatherOccupation(bioData.getFatherOccupation())
                                .motherName("Unlock to view") // MASKED
                                .motherOccupation(bioData.getMotherOccupation())
                                .brothersMarried(bioData.getBrothersMarried())
                                .brothersUnmarried(bioData.getBrothersUnmarried())
                                .sistersMarried(bioData.getSistersMarried())
                                .sistersUnmarried(bioData.getSistersUnmarried())
                                .membershipStatus(bioData.getMembershipStatus())
                                .build();
        }

        private void updateBioDataFields(BioData bioData, BioDataSubmissionRequest request) {
                bioData.setFullName(request.fullName());
                bioData.setPhotoUrl(request.photoUrl());
                bioData.setGender(request.gender());
                bioData.setMaritalStatus(request.maritalStatus());
                bioData.setContactNumber(request.contactNumber());
                bioData.setDob(request.dob());
                bioData.setBirthTime(request.birthTime());
                bioData.setBirthPlace(request.birthPlace());
                bioData.setFamilyAddress(request.familyAddress());
                bioData.setFamilyCity(request.familyCity());
                bioData.setFamilyState(request.familyState());
                bioData.setFamilyCountry(request.familyCountry());
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
                bioData.setMotherName(request.motherName());
                bioData.setMotherOccupation(request.motherOccupation());
                bioData.setBrothersMarried(request.brothersMarried());
                bioData.setBrothersUnmarried(request.brothersUnmarried());
                bioData.setSistersMarried(request.sistersMarried());
                bioData.setSistersUnmarried(request.sistersUnmarried());
        }
}