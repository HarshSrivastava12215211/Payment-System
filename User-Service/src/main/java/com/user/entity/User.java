package com.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name ="users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;
    private String role; // USER / ADMIN
    
    @Column(name = "blocked", columnDefinition = "boolean default false")
    private boolean isBlocked;
    
    @Column(name = "kyc_approved", columnDefinition = "boolean default false")
    private boolean isKycApproved;

    @Column(name = "verified", columnDefinition = "boolean default false")
    private boolean isVerified;
}