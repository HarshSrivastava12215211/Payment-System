package com.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "KYC-SERVICE")
public interface KycClient {

    @GetMapping("/api/kyc/all")
    List<Object> getAllKycs(); // Using Object for simplicity if DTO is not available in Admin

    @PutMapping("/api/kyc/{userId}/approve")
    void approveKyc(@org.springframework.web.bind.annotation.PathVariable("userId") String userId);

    @PutMapping("/api/kyc/{userId}/reject")
    void rejectKyc(@org.springframework.web.bind.annotation.PathVariable("userId") String userId);
}
