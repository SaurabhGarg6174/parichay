package com.aggarjan.patrika.parichay.modules.directory.model;

import com.aggarjan.patrika.parichay.core.model.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "tbl_business_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessListing extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category; // Caterer, Jeweler, Tent House, etc.
    private String contactPerson;
    private String contactNumber;
    private String address;
    private String city;
    private String bannerUrl; // URL for the ad banner

    @Builder.Default
    private boolean isActive = true;
}
