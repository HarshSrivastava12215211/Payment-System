package com.wallet.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.entity.LedgerEntry;

public interface LedgerRepository extends JpaRepository<LedgerEntry, String> {
    List<LedgerEntry> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<LedgerEntry> findByWalletIdOrderByCreatedAtDesc(String walletId);
    List<LedgerEntry> findByUserIdAndReferenceType(Long userId, String referenceType);
}
