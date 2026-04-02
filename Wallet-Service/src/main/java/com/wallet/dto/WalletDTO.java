package com.wallet.dto;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
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
public class WalletDTO {
	
	private String walletId;
	private Long userId;
	private String Currency;
	private BigDecimal balance;
	private boolean isFrozen;
}
