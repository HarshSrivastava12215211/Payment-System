package com.wallet.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntryDTO {
    private String id;
    private String walletId;
    private Long userId;
    private String type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceId;
    private String referenceType;
    private String createdAt;
}
