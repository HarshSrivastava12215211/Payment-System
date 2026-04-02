package com.wallet.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.entity.WalletLimit;

public interface WalletLimitRepository extends JpaRepository<WalletLimit, String> {
    Optional<WalletLimit> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
