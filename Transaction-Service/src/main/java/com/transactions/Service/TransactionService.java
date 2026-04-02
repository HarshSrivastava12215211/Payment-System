package com.transactions.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.transactions.Repository.TransactionRepository;
import com.transactions.dto.CreateTransactionRequest;
import com.transactions.dto.TransactionDTO;
import com.transactions.dto.UpdateTransactionRequest;
import com.transactions.entity.Transaction;
import com.transactions.entity.TransactionStatus;
import com.transactions.exception.TransactionNotFoundException;

import jakarta.transaction.Transactional;


@Service
public class TransactionService {
	
	private final TransactionRepository transactionRepository;
	
	public TransactionService (TransactionRepository repository)
	{
		this.transactionRepository = repository;
	}
	
	@Transactional
	public TransactionDTO createTransaction(CreateTransactionRequest request)
	{
		Transaction tx = Transaction.builder()
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .type(request.getType())
                .idempotencyKey(request.getIdempotencyKey())
                .referenceId(request.getReferenceId())
                .status(TransactionStatus.PENDING)
                .build();
		
		tx = transactionRepository.save(tx);
		return toDTO(tx);
		
		
	}
	
	@Transactional
	public TransactionDTO updateTransaction(String transactionId, UpdateTransactionRequest request)
	{
		Transaction tx = transactionRepository.findById(transactionId).orElseThrow(() -> new TransactionNotFoundException("Transaction Not Found"));
		
		tx.setStatus(TransactionStatus.valueOf(request.getStatus()));
		if(request.getFailureReason() != null)
		{
			tx.setFailureReason(request.getFailureReason());
		}
		
		tx = transactionRepository.save(tx);
		return toDTO(tx);
	}
	
	@Transactional
	public TransactionDTO getTransaction(String transactionId)
	{
		Transaction tx = transactionRepository.findById(transactionId).orElseThrow(() -> new TransactionNotFoundException("Transaction Id is Inavlid"));
		return toDTO(tx);
	}
	
	@Transactional
	public TransactionDTO getByIdempotencyKey(String IdempotencyKey)
	{
		Transaction tx = transactionRepository.findByIdempotencyKey(IdempotencyKey).orElseThrow(() -> new TransactionNotFoundException("Idempotenmcy Key is INVALID"));
		
		return toDTO(tx);
	}
	
	@Transactional
	public List<TransactionDTO> getBySender(String SenderId)
	{
		return transactionRepository.findBySenderIdOrderByCreatedAtDesc(SenderId).stream().map(this::toDTO).collect(Collectors.toList());
	}
	
	@Transactional
	public List<TransactionDTO> getPendingRequest()
	{
		return transactionRepository.findByStatus(TransactionStatus.PENDING).stream().map(this ::toDTO).collect(Collectors.toList());
	}

	@Transactional
	public List<TransactionDTO> getAllTransactions() {
		return transactionRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
	}

	@Transactional
	public List<TransactionDTO> getSuspiciousTransactions() {
		// Define suspicious as amount > 10000
		return transactionRepository.findByAmountGreaterThanOrderByCreatedAtDesc(new java.math.BigDecimal("10000"))
				.stream().map(this::toDTO).collect(Collectors.toList());
	}
	
	
	private TransactionDTO toDTO(Transaction tx) {
        return TransactionDTO.builder()
                .transactionId(tx.getTransactionId())
                .senderId(tx.getSenderId())
                .receiverId(tx.getReceiverId())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .status(tx.getStatus().name())
                .type(tx.getType())
                .idempotencyKey(tx.getIdempotencyKey())
                .referenceId(tx.getReferenceId())
                .failureReason(tx.getFailureReason())
                .createdAt(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null)
                .updatedAt(tx.getUpdatedAt() != null ? tx.getUpdatedAt().toString() : null)
                .build();
    }

}
