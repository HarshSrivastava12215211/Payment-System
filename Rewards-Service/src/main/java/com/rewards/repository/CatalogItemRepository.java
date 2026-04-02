package com.rewards.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.RewardCatalogItem;

public interface CatalogItemRepository extends JpaRepository<RewardCatalogItem, String> {
    List<RewardCatalogItem> findByIsActiveTrue();
    List<RewardCatalogItem> findByIsActiveTrueAndStockGreaterThan(int stock);
}
