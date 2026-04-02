package com.payments.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.payments.dto.CreateTransactionRequest;
import com.payments.dto.TransactionDTO;
import com.payments.dto.UpdateTransactionRequest;


@FeignClient(name = "Transaction-Service", url = "${services.transaction.url:http://transaction-service:7506}", path = "/api/transaction")
public interface TransactionClient {
	
	@PostMapping
	TransactionDTO createTransaction(@RequestBody CreateTransactionRequest request);
	
	@PutMapping("/{transactionId}")
	TransactionDTO updateTransaction(@PathVariable("transactionId") String transactionId, @RequestBody UpdateTransactionRequest request);
	
	@GetMapping("/{transactionId}")
	TransactionDTO getTransaction(@PathVariable("transactionId") String transactionId);

}
