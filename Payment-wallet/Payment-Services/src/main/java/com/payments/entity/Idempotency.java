package com.payments.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
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
public class Idempotency {
	
	@Id
	@Column(name = "idempotency_key")
	public String idempotencyKey;
	@Column(name = "request_Hash")
	public String requestHash;
	@Column(columnDefinition ="TEXT")
	public String response;
	@Column(nullable = false, length = 20)
	public String status;
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
	
	protected void onCreate()
	{
		this.createdAt = LocalDateTime.now();
		
	}

}
