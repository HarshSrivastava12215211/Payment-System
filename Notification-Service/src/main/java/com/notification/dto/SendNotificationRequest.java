package com.notification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {

    @NotNull
    private Long userId;

    @NotNull
    private String type; // EMAIL, SMS, PUSH

    @NotNull
    private String channel; // REGISTRATION, KYC, TRANSACTION, REWARD, DISPUTE

    private String subject;

    @NotNull
    private String message;

    private String recipientEmail;
    private String recipientPhone;
}
