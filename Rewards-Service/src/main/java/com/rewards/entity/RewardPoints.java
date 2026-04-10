package com.rewards.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reward_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private long totalPoints;

    @Column(nullable = false)
    private long availablePoints;

    @Column(nullable = false)
    private long lifetimePoints;

    @Column(nullable = false, length = 20)
    private String tier; // BRONZE, SILVER, GOLD, PLATINUM

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
        if (this.tier == null) {
            this.tier = "BRONZE";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
