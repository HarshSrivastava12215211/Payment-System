package com.kyc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import com.kyc.entity.*;
import com.kyc.repository.KycRepository;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository repository;
    private final FileStorageService fileStorageService;

    public void submitKyc(String userId,
                          String fullName,
                          String aadhaar,
                          String pan,
                          MultipartFile file) {

        // Prevent duplicate KYC
        if (repository.existsByUserId(userId)) {
            throw new RuntimeException("KYC already submitted");
        }

        // Save file
        String filePath = fileStorageService.saveFile(file);

        // Mask sensitive data
        String maskedAadhaar = mask(aadhaar);
        String maskedPan = mask(pan);

        // Create entity
        Kyc record = Kyc.builder()
                .userId(userId)
                .fullName(fullName)
                .aadhaarNumber(maskedAadhaar)
                .panNumber(maskedPan)
                .documentUrl(filePath)
                .status(KycStatus.PENDING)
                .build();

        repository.save(record);
    }

    public List<Kyc> getAllKycs() {
        return repository.findAll();
    }

    private String mask(String value) {
        if (value == null || value.length() <= 4) return value;
        return "XXXX-XXXX-" + value.substring(value.length() - 4);
    }
}