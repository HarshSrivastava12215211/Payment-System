package com.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignDTO {
    private String id;
    private String name;
    private String description;
    private long bonusPoints;
    private String triggerType;
    private String startDate;
    private String endDate;
    private int maxRedemptions;
    private int currentRedemptions;
    private String eligibleTier;
    private boolean isActive;
}
