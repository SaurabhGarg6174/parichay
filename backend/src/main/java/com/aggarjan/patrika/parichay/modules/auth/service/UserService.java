package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.modules.auth.dto.UserDto;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(user -> new UserDto(
                user.getId(),
                user.getEmail(),
                user.getProfile() != null ? user.getProfile().getFullName() : "Unknown",
                user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet())
        ));
    }
}
