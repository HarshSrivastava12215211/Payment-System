package com.transactions.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FraudEvaluationRequest {
    private String senderId;
    private String receiverId;
    private BigDecimal amount;
    private String type;
    private BigDecimal senderOldBalance;
    private BigDecimal receiverOldBalance;
}
