package com.kyc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.kyc.entity.Kyc;

import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, String> {

    Optional<Kyc> findByUserId(String userId);

    boolean existsByUserId(String userId);
}