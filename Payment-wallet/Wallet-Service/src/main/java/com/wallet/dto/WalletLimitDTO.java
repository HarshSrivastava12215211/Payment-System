package com.wallet.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletLimitDTO {
    private Long userId;
    private BigDecimal dailyTopUpLimit;
    private BigDecimal dailyTransferLimit;
    private int maxTransfersPerDay;
    private BigDecimal topUpToday;
    private BigDecimal transfersToday;
    private int transferCountToday;
    private String lastResetDate;
}
