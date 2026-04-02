package com.kyc.dto;

import lombok.Data;

@Data
public class KycRequestDTO {

    private String userId;
    private String fullName;
    private String aadhaar;
    private String pan;

}