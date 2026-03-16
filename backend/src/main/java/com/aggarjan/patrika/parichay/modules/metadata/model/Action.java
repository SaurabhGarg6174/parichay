package com.aggarjan.patrika.parichay.modules.metadata.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Action {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, unique = true)
    private String code;

    private String icon;

    private String color;

    @Column(name = "target_module")
    private String targetModule;

    @Column(name = "target_status_id")
    private Long targetStatusId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
