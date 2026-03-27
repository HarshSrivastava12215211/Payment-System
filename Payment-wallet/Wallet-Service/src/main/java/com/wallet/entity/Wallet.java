package com.wallet.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {
	@Id
	private String walletId;
	private Long userId;
	private BigDecimal balance;
	private String currency;
	
	@Column(columnDefinition = "boolean default false")
	private boolean isFrozen;
	
	@Version
	private Long version; // Created to prevent the false transition of money at the time of multiple transaction at a Particular time.
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	/*
	 * Automatically fills the fields at the time of creation. 
	 */
	@PrePersist
	public void prePersist()
	{
		this.walletId = UUID.randomUUID().toString(); // Random UUID will be generated for the walletId
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}
	
	@PreUpdate
	public void preUpdate()
	{
		this.updatedAt = LocalDateTime.now();
	}
	
}
