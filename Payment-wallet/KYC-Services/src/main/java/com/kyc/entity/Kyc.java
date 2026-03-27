package com.kyc.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = "userId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kyc {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private String fullName;

    // Masked values only
    private String aadhaarNumber;
    private String panNumber;

    // This will later become S3 URL
    @Column(nullable = false)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Auto-set on create
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = KycStatus.PENDING;
    }

    // Auto-update on update
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}