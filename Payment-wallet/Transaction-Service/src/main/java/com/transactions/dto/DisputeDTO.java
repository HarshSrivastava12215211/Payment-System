package com.transactions.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeDTO {
    private String id;
    private String transactionId;
    private Long userId;
    private String reason;
    private String status;
    private String adminNote;
    private String resolution;
    private String createdAt;
    private String updatedAt;
}
