package com.aggarjan.patrika.parichay.modules.metadata.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_lookups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lookup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category; // e.g. "GOTRA", "MARITAL_STATUS"

    @Column(nullable = false)
    private String label; // e.g. "Bansal", "Married"

    @Column(nullable = false)
    private String value; // e.g. "BANSAL", "MARRIED"

    private String description;

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
