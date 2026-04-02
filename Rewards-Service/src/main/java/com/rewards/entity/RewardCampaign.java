package com.rewards.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reward_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private long bonusPoints;

    @Column(nullable = false, length = 30)
    private String triggerType; // FIRST_TOPUP, TOPUP, TRANSFER, SIGNUP

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    private int maxRedemptions;

    @Column(nullable = false)
    private int currentRedemptions;

    @Column(length = 20)
    private String eligibleTier; // null = all tiers

    @Column(columnDefinition = "boolean default true")
    private boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.currentRedemptions = 0;
        this.isActive = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
