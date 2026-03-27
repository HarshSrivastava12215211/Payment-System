package com.transactions.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transactions.Service.TransactionService;
import com.transactions.dto.CreateTransactionRequest;
import com.transactions.dto.TransactionDTO;

@WebMvcTest(TransactionalController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateTransaction_Success() throws Exception {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .senderId("1")
                .recieverId("2")
                .amount(new BigDecimal("100.00"))
                .build();

        TransactionDTO transactionDto = TransactionDTO.builder()
                .transactionId("TXN123")
                .status("PENDING")
                .build();

        when(transactionService.createTransaction(any(CreateTransactionRequest.class))).thenReturn(transactionDto);

        mockMvc.perform(post("/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("TXN123"));
    }

    @Test
    void testGetTransaction_Success() throws Exception {
        TransactionDTO transactionDto = TransactionDTO.builder()
                .transactionId("TXN123")
                .status("SUCCESS")
                .build();

        when(transactionService.getTransaction(anyString())).thenReturn(transactionDto);

        mockMvc.perform(get("/transactions/TXN123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
