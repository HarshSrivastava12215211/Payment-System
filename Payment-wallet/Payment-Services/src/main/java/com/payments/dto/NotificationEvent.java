package com.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {
    private Long userId;
    private String type; // EMAIL, SMS, PUSH
    private String channel; // REGISTRATION, KYC, TRANSACTION, REWARD, DISPUTE
    private String subject;
    private String message;
    private String recipientEmail;
    private String recipientPhone;
}
