package com.kyc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.kyc.service.KycService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;
import com.kyc.entity.Kyc;
import lombok.extern.slf4j.Slf4j;

@Slf4j

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@Tag(name = "KYC APIs", description = "Operations related to KYC")
public class KycController {

    private final KycService service;
    
    @Operation(summary = "Submit KYC with document upload")
    @PostMapping(value = "/submit", consumes = "multipart/form-data")
    public ResponseEntity<String> submitKyc(
            @RequestParam("userId") String userId,
            @RequestParam("fullName") String fullName,
            @RequestParam("aadhaar") String aadhaar,
            @RequestParam("pan") String pan,
            @RequestParam("file") MultipartFile file
    ) {

        service.submitKyc(userId, fullName, aadhaar, pan, file);

        return ResponseEntity.ok("KYC submitted successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<Kyc>> getAllKycs() {
        return ResponseEntity.ok(service.getAllKycs());
    }

    @PutMapping("/{userId}/approve")
    public ResponseEntity<String> approveKyc(@PathVariable String userId) {
        service.updateKycStatus(userId, com.kyc.entity.KycStatus.VERIFIED);
        return ResponseEntity.ok("KYC approved successfully");
    }

    @PutMapping("/{userId}/reject")
    public ResponseEntity<String> rejectKyc(@PathVariable String userId) {
        service.updateKycStatus(userId, com.kyc.entity.KycStatus.REJECTED);
        return ResponseEntity.ok("KYC rejected successfully");
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<Kyc> getKycStatus(@PathVariable String userId) {
        Optional<Kyc> kyc = service.getKycByUserId(userId);
        return kyc.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
}