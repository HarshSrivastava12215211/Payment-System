package com.rewards.dto;

import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardRuleDTO {
    private String id;
    private String name;
    private String description;
    private int pointsPerUnit;
    private BigDecimal unitAmount;
    private String transactionType;
    private boolean isActive;
}
