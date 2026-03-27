package com.rewards.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewards.entity.RewardCampaign;

public interface CampaignRepository extends JpaRepository<RewardCampaign, String> {
    List<RewardCampaign> findByIsActiveTrue();
    List<RewardCampaign> findByTriggerTypeAndIsActiveTrueAndStartDateBeforeAndEndDateAfter(
            String triggerType, LocalDateTime now1, LocalDateTime now2);
}
