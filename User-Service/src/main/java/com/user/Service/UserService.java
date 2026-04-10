package com.user.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.user.dto.UpdateProfileRequest;
import com.user.dto.UserDto;
import com.user.entity.User;
import com.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToDto(user);
    }

    public void blockUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        userRepository.save(user);
    }

    public void unblockUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        userRepository.save(user);
    }

    public UserDto updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        String nextName = request.getName() == null ? "" : request.getName().trim();
        String nextPhone = request.getPhone() == null ? "" : request.getPhone().trim();

        if (nextName.isEmpty()) {
            throw new RuntimeException("Name is required");
        }

        if (nextPhone.isEmpty()) {
            throw new RuntimeException("Phone is required");
        }

        userRepository.findByPhone(nextPhone)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Phone number already in use");
                });

        user.setName(nextName);
        user.setPhone(nextPhone);

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isBlocked(user.isBlocked())
                .isKycApproved(user.isKycApproved())
                .build();
    }

    public void approveKyc(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycApproved(true);
        userRepository.save(user);
    }

    public void rejectKyc(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycApproved(false);
        userRepository.save(user);
    }
}
