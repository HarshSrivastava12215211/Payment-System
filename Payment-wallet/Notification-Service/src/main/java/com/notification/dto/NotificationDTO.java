package com.notification.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private Long userId;
    private String type;
    private String channel;
    private String subject;
    private String message;
    private String status;
    private String recipientEmail;
    private String recipientPhone;
    private String createdAt;
}
