package com.rewards.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletOperationRequest {
    private Long userId;
    private BigDecimal amount;
    private String currency;
}
