package com.rewards.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reward_catalog")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private long pointsCost;

    @Column(nullable = false, length = 20)
    private String type; // COUPON, CASHBACK, GIFT

    private String couponCode;

    @Column(nullable = false)
    private int stock;

    @Column(length = 20)
    private String minTier; // SILVER, GOLD, PLATINUM (minimum tier required)

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
