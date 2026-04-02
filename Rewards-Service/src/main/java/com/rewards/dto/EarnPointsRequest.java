package com.rewards.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarnPointsRequest {

    @NotNull
    private Long userId;

    @NotNull
    private BigDecimal transactionAmount;

    @NotNull
    private String transactionType; // TOPUP, TRANSFER, PAYMENT

    private String transactionId; // reference to the originating transaction
}
