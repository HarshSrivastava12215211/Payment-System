package com.wallet.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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
import com.wallet.Service.WalletService;
import com.wallet.dto.CreateWalletRequest;
import com.wallet.dto.WalletDTO;

@WebMvcTest(WalletController.class)
@AutoConfigureMockMvc(addFilters = false)
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WalletService walletService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateWallet_Success() throws Exception {
        CreateWalletRequest request = new CreateWalletRequest();
        request.setUserId(1L);
        request.setInitialBalance(new BigDecimal("100.00"));

        WalletDTO walletDto = WalletDTO.builder()
                .walletId("W123")
                .userId(1L)
                .balance(new BigDecimal("100.00"))
                .build();

        when(walletService.createWallet(any(CreateWalletRequest.class))).thenReturn(walletDto);

        mockMvc.perform(post("/api/wallets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.walletId").value("W123"))
                .andExpect(jsonPath("$.balance").value(100.00));
    }

    @Test
    void testGetWallet_Success() throws Exception {
        WalletDTO walletDto = WalletDTO.builder()
                .walletId("W123")
                .userId(1L)
                .balance(new BigDecimal("1000.00"))
                .build();

        when(walletService.getBalance(anyLong())).thenReturn(walletDto);

        mockMvc.perform(get("/api/wallets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(1000.00));
    }
}
