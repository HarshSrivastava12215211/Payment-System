package com.transactions.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.transactions.Service.DisputeService;
import com.transactions.Service.TransactionService;
import com.transactions.dto.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/transaction")
@Tag(name = "transaction-controller", description = "Operations related to Transactions and Disputes")
public class TransactionalController {


    private final TransactionService service;
    private final DisputeService disputeService;

    @Operation(summary = "Create a new transaction")
    @PostMapping
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody CreateTransactionRequest request) {

        log.info("Received request to create transaction: {}", request);
        TransactionDTO tx = service.createTransaction(request);
        log.info("Transaction created successfully with ID: {}", tx.getTransactionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(tx);

    }

    @Operation(summary = "Get transaction by sender ID")
    @GetMapping("/{userId}")
    public ResponseEntity<TransactionDTO> getById(@PathVariable String userId) {

        return ResponseEntity.ok(service.getTransaction(userId));
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionDTO> update(@PathVariable String transactionId, @RequestBody UpdateTransactionRequest request) {
        return ResponseEntity.ok(service.updateTransaction(transactionId, request));
    }

    @GetMapping("/idempotence/{id}")
    public ResponseEntity<TransactionDTO> getByIdempotencyKey(@PathVariable String id) {
        return ResponseEntity.ok(service.getByIdempotencyKey(id));
    }

    @GetMapping("/sender/{id}")
    public ResponseEntity<List<TransactionDTO>> getBySender(@PathVariable String id) {
        return ResponseEntity.ok(service.getBySender(id));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransactionDTO>> getPendingTransaction() {
        return ResponseEntity.ok(service.getPendingRequest());
    }

    @Operation(summary = "Get all transactions")
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {

        return ResponseEntity.ok(service.getAllTransactions());
    }

    @GetMapping("/suspicious")
    public ResponseEntity<List<TransactionDTO>> getSuspiciousTransactions() {
        return ResponseEntity.ok(service.getSuspiciousTransactions());
    }

    // ========================
    // DISPUTES
    // ========================

    @PostMapping("/disputes")
    public ResponseEntity<DisputeDTO> createDispute(@Valid @RequestBody CreateDisputeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(disputeService.createDispute(request));
    }

    @GetMapping("/disputes/user/{userId}")
    public ResponseEntity<List<DisputeDTO>> getUserDisputes(@PathVariable Long userId) {
        return ResponseEntity.ok(disputeService.getUserDisputes(userId));
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<DisputeDTO>> getAllDisputes() {
        return ResponseEntity.ok(disputeService.getAllDisputes());
    }

    @GetMapping("/disputes/open")
    public ResponseEntity<List<DisputeDTO>> getOpenDisputes() {
        return ResponseEntity.ok(disputeService.getOpenDisputes());
    }

    @PutMapping("/disputes/{id}")
    public ResponseEntity<DisputeDTO> updateDispute(@PathVariable String id, @RequestBody UpdateDisputeRequest request) {
        return ResponseEntity.ok(disputeService.updateDispute(id, request));
    }
}

