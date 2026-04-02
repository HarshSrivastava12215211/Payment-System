package com.rewards.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedemptionDTO {
    private String id;
    private Long userId;
    private String catalogItemId;
    private String catalogItemName;
    private long pointsSpent;
    private String status;
    private String couponCode;
    private String createdAt;
}
