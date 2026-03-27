package com.transactions.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDisputeRequest {

    @NotNull
    private String transactionId;

    @NotNull
    private Long userId;

    @NotNull
    private String reason;
}
