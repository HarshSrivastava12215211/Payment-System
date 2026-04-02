package com.payments.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.payments.PaymentServicesApplication;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.payments.client.TransactionClient;
import com.payments.client.WalletClient;
import com.payments.dto.CreateTransactionRequest;
import com.payments.dto.PaymentRequest;
import com.payments.dto.PaymentResponse;
import com.payments.dto.TransactionDTO;
import com.payments.dto.UpdateTransactionRequest;
import com.payments.dto.WalletOperationRequest;
import com.payments.entity.Idempotency;
import com.payments.repository.IdempotencyRepository;

import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class PaymentService {

	private final IdempotencyRepository idempotencyRepository;
	private final WalletClient walletClient;
    private final TransactionClient transactionClient;
    private final com.payments.client.UserClient userClient;
    private final com.payments.publisher.NotificationPublisher notificationPublisher;
    private final com.payments.publisher.PaymentEventPublisher paymentEventPublisher;
    private final MeterRegistry meterRegistry;

    private final Counter successCounter;
    private final Counter failureCounter;

    public PaymentService(IdempotencyRepository idempotencyRepository, WalletClient walletClient,
                          TransactionClient transactionClient, com.payments.client.UserClient userClient,
                          com.payments.publisher.NotificationPublisher notificationPublisher,
                          com.payments.publisher.PaymentEventPublisher paymentEventPublisher,
                          MeterRegistry meterRegistry) {
        this.idempotencyRepository = idempotencyRepository;
        this.walletClient = walletClient;
        this.transactionClient = transactionClient;
        this.userClient = userClient;
        this.notificationPublisher = notificationPublisher;
        this.paymentEventPublisher = paymentEventPublisher;
        this.meterRegistry = meterRegistry;

        this.successCounter = Counter.builder("payments.processed.total")
                .tag("status", "success")
                .description("Total number of successful payments")
                .register(meterRegistry);

        this.failureCounter = Counter.builder("payments.processed.total")
                .tag("status", "failure")
                .description("Total number of failed payments")
                .register(meterRegistry);
    }




	
	@CircuitBreaker(name = "paymentService", fallbackMethod = "handlePaymentFailure")
	@Retry(name = "paymentRetry", fallbackMethod = "handlePaymentRetryFailure")
	public PaymentResponse ProcessPayment(PaymentRequest request)
	{

		log.info("Processing payment request for sender: {} to receiver: {} for amount: {}", request.getSenderId(), request.getReceiverId(), request.getAmount());
		String requestHash = computeHash(request);
		
		// 1)  IdempotencyCheck -> Check whether the Key is present or not
		
		Optional<Idempotency> existing = idempotencyRepository.findByIdempotencyKey(request.getIdempotencyKey());
		
		if(existing.isPresent())
		{
			Idempotency record = existing.get();
			if(record.getRequestHash().equals(requestHash))
			{
				return desrializeResponse(record.getResponse());
			}
			else
			{
				return PaymentResponse.builder()
						.status("REJECTED")
						.message("Idempotency Key Already exist")
						.build();
			}
		}
		
		// Mark the ACTIVE Idempotency Key as IN Progress.
		Idempotency inProgress = Idempotency.builder()
				.idempotencyKey(request.getIdempotencyKey())
				.requestHash(requestHash)
				.status("IN PROGRESS")
				.response("")
				.build();
		
		idempotencyRepository.save(inProgress);
		
		String transactionId = null;
		
		try
		{
			
			TransactionDTO txn = transactionClient.createTransaction(CreateTransactionRequest.builder()
					.senderId(request.getSenderId())
					.receiverId(request.getReceiverId())
					.amount(request.getAmount())
					.currency(request.getCurrency())
					.type("TRANSFER")
					.idempotencyKey(request.getIdempotencyKey())
					.build());
			
			transactionId = txn.getTransactionId();
			
			
			/* 
			 * Debit Sender account
			 */
			try
			{
				walletClient.debit(WalletOperationRequest.builder()
						.userId(request.getSenderId())
						.amount(request.getAmount())
						.currency(request.getCurrency())
						.build());
			}
			catch(FeignException e)
			{
				return failTransaction(transactionId, request, "Debt Failed" + extractErrorMessage(e),requestHash);
			}
			
			/* 
			 * Credit Receiver Account
			 */
		try
		{
			walletClient.credit(WalletOperationRequest.builder()
					.userId(request.getReceiverId())
					.amount(request.getAmount())
					.currency(request.getCurrency())
					.build());
			
		}
			catch(FeignException ex)
			{
				return rollBackTransaction(transactionId, request, "Credit Failed" + extractErrorMessage(ex),requestHash );
			}
		
		// Step 6 -:  Mark Transaction as SUCCESS
		
		transactionClient.updateTransaction(transactionId, UpdateTransactionRequest.builder()
				.status("SUCCESS")
				.build());
		
		
		// Step 7 -:
		
		PaymentResponse successResponse = PaymentResponse.builder()
                .transactionId(transactionId)
                .status("SUCCESS")
                .message("Payment completed successfully")
                .build();

        saveIdempotencyRecord(request.getIdempotencyKey(), requestHash,
                successResponse, "SUCCESS");

        // Send Notifications
        try {
            com.payments.dto.UserDto sender = userClient.getUserById(Long.parseLong(request.getSenderId()));
            com.payments.dto.UserDto receiver = userClient.getUserById(Long.parseLong(request.getReceiverId()));
            
            notificationPublisher.sendTransactionNotification(sender.getId(), sender.getEmail(), 
                    request.getAmount(), "DEBIT", "SUCCESS");
            notificationPublisher.sendTransactionNotification(receiver.getId(), receiver.getEmail(), 
                    request.getAmount(), "CREDIT", "SUCCESS");
        } catch (Exception e) {
            log.error("Notification trigger failed: {}", e.getMessage());
        }


        // Publish PaymentCompletedEvent (Decoupled Flow)
        try {
            paymentEventPublisher.publishPaymentCompletedEvent(com.payments.dto.PaymentCompletedEvent.builder()
                    .transactionId(transactionId)
                    .userId(request.getSenderId())
                    .amount(request.getAmount())
                    .status("SUCCESS")
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build());
            successCounter.increment();
        } catch (Exception e) {
            log.error("Failed to publish payment completed event: {}", e.getMessage());
        }

        return successResponse;

		
		
		
		
		}
		catch(Exception ex)
		{
			PaymentResponse errorResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .status("FAILED")
                    .message("Unexpected error: " + ex.getMessage())
                    .build();

            if (transactionId != null) {
                try {
                    transactionClient.updateTransaction(transactionId,
                            UpdateTransactionRequest.builder()
                                    .status("FAILED")
                                    .failureReason("Unexpected error: " + ex.getMessage())
                                    .build());
                } catch (Exception updateEx) {
                    log.error("Failed to update transaction status: {}", updateEx.getMessage());
                }

            }

            saveIdempotencyRecord(request.getIdempotencyKey(), requestHash,
                    errorResponse, "FAILED");

            failureCounter.increment();
            return errorResponse;
		}

		
		
	}
	
	public void creditSenderForRazorpay(com.payments.dto.RazorpayVerificationRequest request) {
		walletClient.credit(com.payments.dto.WalletOperationRequest.builder()
				.userId(request.getSenderId())
				.amount(request.getAmount())
				.currency(request.getCurrency())
				.build());
	}

	public void creditSenderForGatewayFallback(PaymentRequest request) {
		walletClient.credit(com.payments.dto.WalletOperationRequest.builder()
				.userId(request.getSenderId())
				.amount(request.getAmount())
				.currency(request.getCurrency())
				.build());
	}

	/*
	 * Create the fail transaction method to handle the Transaction that gets failed
	 */

	private PaymentResponse failTransaction(String transactionId, PaymentRequest request,String reason, String requestHash)
	{
		transactionClient.updateTransaction(transactionId,
                UpdateTransactionRequest.builder()
                        .status("FAILED")
                        .failureReason(reason)
                        .build());
		
		PaymentResponse failedResponse = PaymentResponse.builder()
                .transactionId(transactionId)
                .status("FAILED")
                .message(reason)
                .build();

        saveIdempotencyRecord(request.getIdempotencyKey(), requestHash,
                failedResponse, "FAILED");

        return failedResponse;
	}
	
	
	
	/*
	 * To Prevent the Failed transaction 
	 * and credit the money back to the Senders Id account
	 */
	
	private PaymentResponse rollBackTransaction(String transactionId,PaymentRequest request, String reason, String requestHash)
	{
		try
		{
			walletClient.credit(WalletOperationRequest.builder()
					.userId(request.getSenderId())
					.amount(request.getAmount())
					.currency(request.getCurrency())
					.build());
		}
		
		catch(Exception rollbackEx)
		{
		}
		 // Mark transaction as ROLLBACK
		
		try
		{
			transactionClient.updateTransaction(transactionId, UpdateTransactionRequest.builder().status("ROLLBACK")
					.failureReason(reason).build());
		}
		catch(Exception ex)
		{			
		}
		
		PaymentResponse rollbackResponse = PaymentResponse.builder()
				.transactionId(transactionId)
				.status("ROLLBACK")
				 .message("Pyment rolled back" +reason)
				 .build();
		
		saveIdempotencyRecord(request.getIdempotencyKey(), requestHash, rollbackResponse, "ROLLBACK");
		
		return rollbackResponse;
	}
	
	@Transactional
	private void saveIdempotencyRecord(String key, String hash, PaymentResponse response, String status)
	{
		try
		{
			ObjectMapper mapper = new ObjectMapper();
			Idempotency record = idempotencyRepository.findById(key).orElse(new Idempotency());
			record.setIdempotencyKey(key);
			record.setRequestHash(hash);
			record.setResponse(mapper.writeValueAsString(response));
			record.setStatus(status);
			idempotencyRepository.save(record);
		}
		catch(Exception ex)
		{
			log.error("Issue saving idempotency record: {}", ex.getMessage());
		}

		
	}
	
	
	/*
	 * To desrialize the hashed Context
	 */
	
	private PaymentResponse desrializeResponse(String json) {
		ObjectMapper mapper = new ObjectMapper();
		try
		{
			return mapper.readValue(json, PaymentResponse.class);
		}
		catch(Exception e)
		{
			return PaymentResponse.builder()
					.status("ERROR")
					.message("Failed to retrieve Cache Response")
					.build();
		}
	}


	/*
	 * Compute Hash has been done to convert into the
	 * HASH Code  ->  SHA-256 was used to compute the Payment Service
	 */
	private String computeHash(PaymentRequest request)
	{
		try
		{
			ObjectMapper mapper = new ObjectMapper();
			String json = mapper.writeValueAsString(request);
			 MessageDigest digest = MessageDigest.getInstance("SHA-256");
	            byte[] hashBytes = digest.digest(json.getBytes(StandardCharsets.UTF_8));
	            return HexFormat.of().formatHex(hashBytes);
	        } 
		catch(NoSuchAlgorithmException  | JsonProcessingException e)
		{
			throw new RuntimeException("Failed to Comput Request Hash");
		}
	}
	
	
	// ========================
	// FALLBACKS
	// ========================

	public PaymentResponse handlePaymentFailure(PaymentRequest request, Throwable t) {
		log.error("Circuit Breaker triggered for payment. Error: {}", t.getMessage());
		return PaymentResponse.builder()
				.status("FAILED")
				.message("Payment system is currently unstable. Please try again later. Error: " + t.getMessage())
				.build();
	}

	public PaymentResponse handlePaymentRetryFailure(PaymentRequest request, Throwable t) {
		log.error("Retry failed for payment after multiple attempts. Error: {}", t.getMessage());
		return PaymentResponse.builder()
				.status("FAILED")
				.message("Payment failed after multiple retries. Please check your network or try again later.")
				.build();
	}

	 private String extractErrorMessage(FeignException ex) {

	        if (ex.responseBody().isPresent()) {
	            return new String(ex.responseBody().get().array(), StandardCharsets.UTF_8);
	        }
	        return ex.getMessage();
	    }
	
	
	

}
