package com.user.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.user.Service.UserService;
import com.user.dto.UserDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "User Management", description = "APIs for managing user profiles, blocking, and KYC status")
public class UserController {

    private final UserService userService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Get all users", description = "Retrieves a list of all registered users in the system")
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get user by ID", description = "Retrieves detailed information for a specific user")
    public UserDto getUserById(@io.swagger.v3.oas.annotations.Parameter(description = "Unique ID of the user") @PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/email/{email}")
    public UserDto getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @PutMapping("/{id}/block")
    public void blockUser(@PathVariable Long id) {
        userService.blockUser(id);
    }

    @PutMapping("/{id}/unblock")
    public void unblockUser(@PathVariable Long id) {
        userService.unblockUser(id);
    }

    @PutMapping("/{id}/kyc/approve")
    public void approveKyc(@PathVariable Long id) {
        userService.approveKyc(id);
    }

    @PutMapping("/{id}/kyc/reject")
    public void rejectKyc(@PathVariable Long id) {
        userService.rejectKyc(id);
    }
}
