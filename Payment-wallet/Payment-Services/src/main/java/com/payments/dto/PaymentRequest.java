package com.payments.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

	  @NotBlank(message = "senderId is required")
	    private String senderId;

	    @NotBlank(message = "receiverId is required")
	    private String receiverId;

	    @NotNull(message = "amount is required")
	    @DecimalMin(value = "0.01", message = "amount must be greater than zero")
	    private BigDecimal amount;

	    @NotBlank(message = "currency is required")
	    private String currency;

	    @NotBlank(message = "idempotencyKey is required")
	    private String idempotencyKey;
}
