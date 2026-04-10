package com.transactions.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.transactions.Repository.TransactionRepository;
import com.transactions.dto.CreateTransactionRequest;
import com.transactions.dto.TransactionDTO;
import com.transactions.dto.UpdateTransactionRequest;
import com.transactions.dto.FraudEvaluationRequest;
import com.transactions.dto.FraudEvaluationResponse;
import com.transactions.entity.Transaction;
import com.transactions.entity.TransactionStatus;
import com.transactions.exception.TransactionNotFoundException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;


import jakarta.transaction.Transactional;


@Service
public class TransactionService {
	
	private final TransactionRepository transactionRepository;
	private final RestTemplate restTemplate;
	
	public TransactionService (TransactionRepository repository, RestTemplate restTemplate)
	{
		this.transactionRepository = repository;
		this.restTemplate = restTemplate;
	}
	
	@Transactional
	public TransactionDTO createTransaction(CreateTransactionRequest request)
	{
		// 1. Evaluate Fraud
		FraudEvaluationRequest fraudReq = FraudEvaluationRequest.builder()
				.senderId(request.getSenderId())
				.receiverId(request.getReceiverId())
				.amount(request.getAmount())
				.type(request.getType())
				.senderOldBalance(java.math.BigDecimal.ZERO) // Hardcoded for now, ideal to fetch from Wallet-Service
				.receiverOldBalance(java.math.BigDecimal.ZERO)
				.build();
				
		boolean isFraud = false;
		String failureReason = null;
		
		try {
			ResponseEntity<FraudEvaluationResponse> response = restTemplate.postForEntity("http://FRAUD-DETECTION-SERVICE/api/fraud/evaluate", fraudReq, FraudEvaluationResponse.class);
			FraudEvaluationResponse body = response.getBody();
			if (response.getStatusCode() == HttpStatus.OK && body != null) {
				isFraud = body.isFraud();
				if(isFraud) {
					failureReason = "Transaction flagged as Fraud: " + body.getMessage();
				}
			}
		} catch (Exception e) {
			// If fraud service is down, we might want to log it and continue or fail. Let's continue but warn.
			System.err.println("Failed to reach Fraud Detection Service: " + e.getMessage());
		}

		Transaction tx = Transaction.builder()
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .type(request.getType())
                .idempotencyKey(request.getIdempotencyKey())
                .referenceId(request.getReferenceId())
                .status(isFraud ? TransactionStatus.FAILED : TransactionStatus.PENDING)
                .failureReason(failureReason)
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
