package com.aggarjan.patrika.parichay.modules.auth.service;

import com.aggarjan.patrika.parichay.modules.auth.dto.CreateUserRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.UserDto;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    /**
     * The entry point for every other module that needs a {@link User} by email - keeps user
     * lookup behind this service so no other module has to depend on the auth repository layer directly.
     */
    User getUserByEmailOrThrow(String email);

    Page<UserDto> getAllUsersByStatus(boolean enabled, Pageable pageable);

    Page<UserDto> getAllUsers(Pageable pageable);

    void updateUserStatus(Long userId, boolean enabled);

    UserDto createUser(CreateUserRequest request);

    UserDto updateUser(Long userId, UserDto userDto);

    void deleteUser(Long userId);
}
