package com.payments.dto;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
	

    private String senderId;
    private String receiverId;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String idempotencyKey;
    private String referenceId;

}
