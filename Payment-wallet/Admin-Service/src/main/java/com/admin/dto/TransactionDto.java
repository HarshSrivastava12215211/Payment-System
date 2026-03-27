package com.admin.dto;

import lombok.Data;

@Data
public class TransactionDto {
    private String id;
    private Double amount;
    private String status;
}