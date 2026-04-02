package com.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
	@Id
	private String transactionId;
	private String senderId;
	private String receiverId;
	private BigDecimal amount;
	private String currency;
	private String status;
	private String type;
	private String idempotencyKey;
	private String referenceId;
	private String failureReason;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	

}
