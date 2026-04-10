package com.transactions.dto;

import lombok.Data;

@Data
public class FraudEvaluationResponse {
    private boolean isFraud;
    private double riskScore;
    private String message;
}
