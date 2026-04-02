package com.wallet.dto;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWalletRequest {
	
	@NotNull(message = "User Id is required")
	private Long userId;
	
	@NotNull(message = "Initial Balance is required")
	@DecimalMin(value = "0.00", message = "Initial Balance cannot be negative")
	private BigDecimal initialBalance;
	
	@NotBlank
	private String currency;

}
