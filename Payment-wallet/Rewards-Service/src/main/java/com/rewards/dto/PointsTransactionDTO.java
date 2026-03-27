package com.rewards.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointsTransactionDTO {
    private String id;
    private Long userId;
    private long points;
    private String type;
    private String description;
    private String referenceId;
    private String expiryDate;
    private String createdAt;
}
