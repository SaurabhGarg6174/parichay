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
    private String photoUrl;
    private String gender;
    private String maritalStatus;
    private String contactNumber;
    private LocalDate dob;
    private String birthTime;
    private String birthPlace;
    private String familyAddress;
    private String familyCity;
    private String familyState;
    private String familyCountry;
    private String complexion;
    private Integer height; // in cm
    private Integer weight; // in kg
    private String education;
    private String occupation;
    private Double monthlyIncome;
    private String gotra;

    @Column(name = "is_manglik")
    private String isManglik;

    private Boolean wearsSpectacles;
    private String fatherName;
    private String fatherOccupation;
    private String motherName;
    private String motherOccupation;
    private Integer brothersMarried;
    private Integer brothersUnmarried;
    private Integer sistersMarried;
    private Integer sistersUnmarried;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private MembershipStatus membershipStatus;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Builder.Default
    @Column(name = "is_community_verified")
    private Boolean isCommunityVerified = false;

    @Builder.Default
    @Column(name = "is_photo_hidden")
    private Boolean isPhotoHidden = false;

    public String getFormattedHeight() {
        if (height == null) return "Not specified";
        int ft = (int) Math.floor(height / 30.48);
        int in = (int) Math.round((height % 30.48) / 2.54);
        if (in == 12) { ft++; in = 0; }
        return String.format("%d' %d\" (%d cm)", ft, in, height);
    }

    public String getFormattedWeight() {
        if (weight == null) return "Not specified";
        return weight + " kg";
    }

    public boolean isCommunityVerified() {
        return isCommunityVerified != null && isCommunityVerified;
    }

    public void setCommunityVerified(boolean communityVerified) {
        this.isCommunityVerified = communityVerified;
    }

    public boolean isPhotoHidden() {
        return isPhotoHidden != null && isPhotoHidden;
    }

    public void setPhotoHidden(boolean photoHidden) {
        this.isPhotoHidden = photoHidden;
    }

    @Transient
    @Builder.Default
    private boolean sameGotra = false;

    @Transient
    @Builder.Default
    private boolean isPhotoAccessible = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}