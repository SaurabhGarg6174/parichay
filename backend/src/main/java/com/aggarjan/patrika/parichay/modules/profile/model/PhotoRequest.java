package com.aggarjan.patrika.parichay.modules.profile.model;

import com.aggarjan.patrika.parichay.core.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_photo_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoRequest extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requesterEmail;
    
    private Long targetBioDataId; // The ID of the profile being requested

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }
}
