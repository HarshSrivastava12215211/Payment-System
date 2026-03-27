package com.transactions.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.transactions.Repository.TransactionRepository;
import com.transactions.dto.CreateTransactionRequest;
import com.transactions.dto.TransactionDTO;
import com.transactions.dto.UpdateTransactionRequest;
import com.transactions.entity.Transaction;
import com.transactions.entity.TransactionStatus;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction transaction;

    @BeforeEach
    void setUp() {
        transaction = Transaction.builder()
                .transactionId("TXN123")
                .senderId("1")
                .receiverId("2")
                .amount(new BigDecimal("500.00"))
                .status(TransactionStatus.PENDING)
                .build();
    }

    @Test
    void testCreateTransaction_Success() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .senderId("1")
                .recieverId("2")
                .amount(new BigDecimal("500.00"))
                .type("TRANSFER")
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionDTO result = transactionService.createTransaction(request);

        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testUpdateTransaction_Success() {
        UpdateTransactionRequest request = UpdateTransactionRequest.builder()
                .status("SUCCESS")
                .build();

        when(transactionRepository.findById("TXN123")).thenReturn(Optional.of(transaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionDTO result = transactionService.upateTransaction("TXN123", request);

        assertEquals("SUCCESS", result.getStatus());
        verify(transactionRepository, times(1)).save(transaction);
    }

    @Test
    void testGetSuspiciousTransactions() {
        Transaction suspicious = Transaction.builder()
                .amount(new BigDecimal("15000.00"))
                .status(TransactionStatus.SUCCESS)
                .build();
        
        when(transactionRepository.findByAmountGreaterThanOrderByCreatedAtDesc(any(BigDecimal.class)))
                .thenReturn(Arrays.asList(suspicious));

        List<TransactionDTO> result = transactionService.getSuspiciousTransactions();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }
}
