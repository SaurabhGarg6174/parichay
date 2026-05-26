package com.aggarjan.patrika.parichay.modules.profile.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.profile.model.MembershipStatus;
import com.aggarjan.patrika.parichay.modules.profile.repository.MembershipStatusRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/metadata/statuses")
@RequiredArgsConstructor
public class StatusController {

    private final MembershipStatusRepo membershipStatusRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipStatus>>> getAllStatuses() {
        return ResponseEntity.ok(ApiResponse.success(
                membershipStatusRepo.findAll(),
                "Membership statuses fetched successfully"
        ));
    }
}
