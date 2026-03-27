package com.wallet.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.entity.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, String>{
	
	Optional<Wallet> findByUserId(Long userId);
	
	boolean existsByUserId(Long userId);

}
