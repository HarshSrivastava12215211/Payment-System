package com.transactions.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.transactions.entity.Dispute;
import com.transactions.entity.DisputeStatus;

public interface DisputeRepository extends JpaRepository<Dispute, String> {
    List<Dispute> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Dispute> findByStatus(DisputeStatus status);
    List<Dispute> findByTransactionId(String transactionId);
}
