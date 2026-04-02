package com.rewards.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.Redemption;

public interface RedemptionRepository extends JpaRepository<Redemption, String> {
    List<Redemption> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByCatalogItemId(String catalogItemId);
}
