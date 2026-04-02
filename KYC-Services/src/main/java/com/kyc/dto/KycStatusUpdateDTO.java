package com.kyc.dto;

import com.kyc.entity.KycStatus;
import lombok.Data;

@Data
public class KycStatusUpdateDTO {

    private String userId;
    private KycStatus status;

}