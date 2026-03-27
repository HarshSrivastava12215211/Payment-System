package com.rewards.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.RewardPoints;

public interface RewardPointsRepository extends JpaRepository<RewardPoints, String> {
    Optional<RewardPoints> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
