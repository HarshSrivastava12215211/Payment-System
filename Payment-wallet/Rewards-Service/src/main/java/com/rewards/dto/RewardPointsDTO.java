package com.rewards.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPointsDTO {
    private String id;
    private Long userId;
    private long totalPoints;
    private long availablePoints;
    private long lifetimePoints;
    private String tier;
}
