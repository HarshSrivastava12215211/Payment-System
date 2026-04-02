package com.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActionDTO {
    private String id;
    private Long adminId;
    private String action;
    private Long targetUserId;
    private String details;
    private String createdAt;
}
