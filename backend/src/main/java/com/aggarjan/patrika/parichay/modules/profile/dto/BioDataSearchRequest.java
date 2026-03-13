package com.aggarjan.patrika.parichay.modules.profile.dto;

public record BioDataSearchRequest(
        String name,
        String gotra,
        String gender,
        Integer minAge,
        Integer maxAge,
        String education,
        String city,
        String isManglik) {
}
