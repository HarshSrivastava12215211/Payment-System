package com.rewards.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.PointsTransaction;
import com.rewards.entity.PointsTransactionType;

public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, String> {
    List<PointsTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PointsTransaction> findByUserIdAndType(Long userId, PointsTransactionType type);
    List<PointsTransaction> findByTypeAndExpiryDateBefore(PointsTransactionType type, LocalDateTime date);
}
