package com.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "KYC-Service")
public interface KycClient {

    @GetMapping("/kyc/all")
    List<Object> getAllKycs(); // Using Object for simplicity if DTO is not available in Admin
}
