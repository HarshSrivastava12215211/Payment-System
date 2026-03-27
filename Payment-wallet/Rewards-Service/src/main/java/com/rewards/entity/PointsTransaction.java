package com.rewards.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "points_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointsTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private long points;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PointsTransactionType type; // EARN, REDEEM, EXPIRE, BONUS

    private String description;

    private String referenceId; // transactionId or campaignId

    private LocalDateTime expiryDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.type == PointsTransactionType.EARN && this.expiryDate == null) {
            this.expiryDate = LocalDateTime.now().plusDays(365);
        }
    }
}
