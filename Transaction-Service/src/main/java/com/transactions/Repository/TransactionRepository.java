package com.transactions.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

import com.transactions.entity.Transaction;
import com.transactions.entity.TransactionStatus;



@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
	
	Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    List<Transaction> findBySenderIdOrderByCreatedAtDesc(String senderId);

    List<Transaction> findByReceiverIdOrderByCreatedAtDesc(String receiverId);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findByAmountGreaterThanOrderByCreatedAtDesc(java.math.BigDecimal amount);
}
