package com.aggarjan.patrika.parichay.modules.auth.dto;

import java.util.Set;

public record UserDto(
        Long id,
        String email,
        String fullName,
        Set<String> roles) {
}
