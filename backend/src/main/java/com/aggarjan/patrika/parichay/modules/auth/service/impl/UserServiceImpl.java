package com.aggarjan.patrika.parichay.modules.auth.service.impl;

import com.aggarjan.patrika.parichay.core.exception.ResourceNotFoundException;
import com.aggarjan.patrika.parichay.modules.auth.dto.CreateUserRequest;
import com.aggarjan.patrika.parichay.modules.auth.dto.UserDto;
import com.aggarjan.patrika.parichay.modules.auth.model.Role;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.model.UserProfile;
import com.aggarjan.patrika.parichay.modules.auth.repository.RoleRepository;
import com.aggarjan.patrika.parichay.modules.auth.repository.UserRepository;
import com.aggarjan.patrika.parichay.modules.auth.repository.UserProfileRepository;
import com.aggarjan.patrika.parichay.modules.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public Page<UserDto> getAllUsersByStatus(boolean enabled, Pageable pageable) {
        return userRepository.findByEnabled(enabled, pageable).map(this::mapToDto);
    }

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        Set<Role> roles = request.roles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(roles)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .fullName(request.fullName())
                .user(savedUser)
                .build();
        userProfileRepository.save(profile);

        savedUser.setProfile(profile);
        return mapToDto(savedUser);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setEmail(userDto.email());
        user.setEnabled(userDto.enabled());

        // Update or create profile
        if (user.getProfile() != null) {
            user.getProfile().setFullName(userDto.fullName());
            userProfileRepository.save(user.getProfile());
        } else {
            UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(userDto.fullName())
                .build();
            user.setProfile(profile);
            userProfileRepository.save(profile);
        }

        if (userDto.roles() != null && !userDto.roles().isEmpty()) {
            Set<Role> roles = userDto.roles().stream()
                    .map(roleName -> roleRepository.findByName(roleName)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        User savedUser = userRepository.saveAndFlush(user);
        return mapToDto(savedUser);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getProfile() != null ? user.getProfile().getFullName() : "Unknown",
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                user.isEnabled()
        );
    }
}
