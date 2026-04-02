package com.rewards.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.RewardRule;

public interface RewardRuleRepository extends JpaRepository<RewardRule, String> {
    List<RewardRule> findByIsActiveTrue();
    List<RewardRule> findByTransactionTypeAndIsActiveTrue(String transactionType);
    Optional<RewardRule> findByNameAndIsActiveTrue(String name);
}
