package com.transactions.dto;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
	
	@NotBlank(message = "Sender Id Can not be null")
	private String senderId;
	@NotBlank(message = "Sender Id Can not be null")
	private String recieverId;
	
	@NotNull
	@DecimalMin(value = "0.01", message = "amount must be greater than zero")
	private BigDecimal amount;
	
	@NotBlank(message  = "Type the currency name")
	private String currency;
	
	@NotBlank(message = "Type is required")
	private String type;
	
	private String idempotencyKey;
	
	private String refrrenceId;

}
