package com.kyc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.kyc.service.KycService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
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
}