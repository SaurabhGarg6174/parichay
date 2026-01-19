package com.aggarjan.patrika.parichay.modules.profile.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_bio_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BioData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private LocalDate dob;
    private String birthTime;
    private String birthPlace;
    private String familyAddress;
    private String complexion;
    private String height;
    private String weight;
    private String education;
    private String occupation;
    private Double monthlyIncome;
    private String gotra;
    @Column(name = "is_manglik")
    private Boolean isManglik;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private MembershipStatus membershipStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
