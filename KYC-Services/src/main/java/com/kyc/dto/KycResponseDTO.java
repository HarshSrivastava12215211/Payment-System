package com.kyc.dto;

import com.kyc.entity.KycStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KycResponseDTO {

    private String userId;
    private KycStatus status;
    private String documentUrl;

}