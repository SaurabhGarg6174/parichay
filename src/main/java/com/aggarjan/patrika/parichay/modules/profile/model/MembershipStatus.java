package com.aggarjan.patrika.parichay.modules.profile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.aggarjan.patrika.parichay.core.model.BaseEntity;

@Entity
@Table(name = "membership_statuses")
@Getter
@Setter
public class MembershipStatus extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "PENDING", "APPROVED", "REJECTED"

    private String description;
}
