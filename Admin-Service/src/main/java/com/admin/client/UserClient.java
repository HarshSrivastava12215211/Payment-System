package com.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import com.admin.config.FeignConfig;
import com.admin.dto.UserDto;

@FeignClient(name = "User-Service")
public interface UserClient {

    @GetMapping("/users")
    List<UserDto> getAllUsers();

    @PutMapping("/users/{id}/block")
    void blockUser(@PathVariable("id") Long id);

    @PutMapping("/users/{id}/unblock")
    void unblockUser(@PathVariable("id") Long id);

    @PutMapping("/users/{id}/kyc/approve")
    void approveKyc(@PathVariable("id") Long id);

    @PutMapping("/users/{id}/kyc/reject")
    void rejectKyc(@PathVariable("id") Long id);
}
