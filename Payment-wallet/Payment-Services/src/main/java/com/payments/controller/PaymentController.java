package com.payments.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payments.Service.PaymentService;
import com.payments.Service.RazorpayService;
import com.payments.dto.PaymentRequest;
import com.payments.dto.PaymentResponse;
import com.payments.dto.RazorpayOrderRequest;
import com.payments.dto.RazorpayOrderResponse;
import com.payments.dto.RazorpayVerificationRequest;
import com.razorpay.RazorpayException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

	
	private final PaymentService services;
    private final RazorpayService razorpayService;
	
	@PostMapping
	public ResponseEntity<PaymentResponse> makePayment(@Valid @RequestBody PaymentRequest request)
	{
		
		PaymentResponse response = services.ProcessPayment(request);
		return switch(response.getStatus())
				{case "SUCCESS" -> ResponseEntity.ok(response);
	            case "REJECTED" -> ResponseEntity.status(409).body(response);
	            case "ROLLBACK" -> ResponseEntity.status(500).body(response);
	            default -> ResponseEntity.badRequest().body(response);
				};
	}

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Payment Service is UP");
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@RequestBody RazorpayOrderRequest request) {
        try {
            RazorpayOrderResponse response = razorpayService.createOrder(request);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<String> verifyRazorpayPayment(@RequestBody RazorpayVerificationRequest request) {
        try {
            boolean isValid = razorpayService.verifyPayment(request);
            if (isValid) {
                // 1. Top up Sender's Wallet
                services.creditSenderForRazorpay(request);

                // 2. Process internal payment transfer
                PaymentRequest paymentRequest = PaymentRequest.builder()
                        .senderId(request.getSenderId())
                        .receiverId(request.getReceiverId())
                        .amount(request.getAmount())
                        .currency(request.getCurrency())
                        .idempotencyKey(request.getIdempotencyKey())
                        .build();

                PaymentResponse response = services.ProcessPayment(paymentRequest);

                if ("SUCCESS".equals(response.getStatus())) {
                    return ResponseEntity.ok("Payment Verified and Completed Successfully");
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Payment Verified but internal transfer failed: " + response.getMessage());
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
            }
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Verification failed: " + e.getMessage());
        }
    }

}
