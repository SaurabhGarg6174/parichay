package com.aggarjan.patrika.parichay.modules.metadata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionDto {
    private Long id;
    private String label;
    private String code;
    private String icon;
    private String color;
    private String targetModule;
    private Long targetStatusId;
    private Integer sortOrder;
}
