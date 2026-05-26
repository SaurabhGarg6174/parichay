package com.aggarjan.patrika.parichay.modules.profile.model;

import com.aggarjan.patrika.parichay.core.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_success_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuccessStory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groomName;
    private String brideName;
    private String story;
    private String photoUrl;
    private String weddingDate;

    @Builder.Default
    private boolean isActive = true;
}
