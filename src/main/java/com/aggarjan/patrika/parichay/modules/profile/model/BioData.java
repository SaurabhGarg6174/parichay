package com.aggarjan.patrika.parichay.modules.profile.model;

import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.aggarjan.patrika.parichay.core.model.BaseEntity;

@Entity
@Table(name = "bio_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BioData extends BaseEntity {
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

    private Boolean wearsSpectacles;
    private String fatherName;
    private String fatherOccupation;
    private Integer brothersMarried;
    private Integer brothersUnmarried;
    private Integer sistersMarried;
    private Integer sistersUnmarried;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private MembershipStatus membershipStatus;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}