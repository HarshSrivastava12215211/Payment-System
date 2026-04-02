package com.wallet.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wallet_limits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal dailyTopUpLimit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal dailyTransferLimit;

    @Column(nullable = false)
    private int maxTransfersPerDay;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal topUpToday;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal transfersToday;

    @Column(nullable = false)
    private int transferCountToday;

    @Column(nullable = false)
    private LocalDate lastResetDate;

    @PrePersist
    public void prePersist() {
        if (this.dailyTopUpLimit == null) this.dailyTopUpLimit = new BigDecimal("50000");
        if (this.dailyTransferLimit == null) this.dailyTransferLimit = new BigDecimal("25000");
        if (this.maxTransfersPerDay == 0) this.maxTransfersPerDay = 10;
        if (this.topUpToday == null) this.topUpToday = BigDecimal.ZERO;
        if (this.transfersToday == null) this.transfersToday = BigDecimal.ZERO;
        if (this.lastResetDate == null) this.lastResetDate = LocalDate.now();
    }
}
