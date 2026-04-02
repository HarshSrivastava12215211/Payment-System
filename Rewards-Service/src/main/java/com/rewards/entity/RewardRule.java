package com.rewards.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reward_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private int pointsPerUnit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal unitAmount;

    @Column(nullable = false, length = 30)
    private String transactionType; // TOPUP, TRANSFER, PAYMENT

    @Column(columnDefinition = "boolean default true")
    private boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
