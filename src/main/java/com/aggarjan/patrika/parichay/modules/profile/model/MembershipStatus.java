package com.aggarjan.patrika.parichay.modules.profile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tbl_membership_status")
@Getter
@Setter
public class MembershipStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "PENDING", "APPROVED", "REJECTED"

    private String description;
}
