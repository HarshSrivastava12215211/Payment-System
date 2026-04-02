package com.transactions.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDisputeRequest {
    private String status; // UNDER_REVIEW, RESOLVED, REJECTED
    private String adminNote;
    private String resolution;
}
