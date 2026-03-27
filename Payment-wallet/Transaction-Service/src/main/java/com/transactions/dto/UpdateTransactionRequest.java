package com.transactions.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTransactionRequest {
	
	private String status;
	private String failureReason;

}
