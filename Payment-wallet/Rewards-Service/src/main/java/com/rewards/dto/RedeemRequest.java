package com.rewards.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemRequest {

    @NotNull
    private Long userId;

    @NotNull
    private String catalogItemId;
}
