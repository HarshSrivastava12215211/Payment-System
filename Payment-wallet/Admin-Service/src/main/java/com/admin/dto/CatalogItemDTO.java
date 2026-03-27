package com.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogItemDTO {
    private String id;
    private String name;
    private String description;
    private long pointsCost;
    private String type;
    private String couponCode;
    private int stock;
    private String minTier;
    private boolean isActive;
}
