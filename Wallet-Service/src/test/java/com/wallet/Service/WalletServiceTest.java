package com.wallet.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wallet.client.UserClient;
import com.wallet.dto.CreateWalletRequest;
import com.wallet.dto.UserDto;
import com.wallet.dto.WalletDTO;
import com.wallet.dto.WalletOperationRequest;
import com.wallet.entity.Wallet;
import com.wallet.entity.WalletLimit;
import com.wallet.repository.LedgerRepository;
import com.wallet.repository.WalletLimitRepository;
import com.wallet.repository.WalletRepository;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private LedgerRepository ledgerRepository;

    @Mock
    private WalletLimitRepository walletLimitRepository;

    @InjectMocks
    private WalletService walletService;

    private Wallet wallet;
    private WalletLimit walletLimit;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        wallet = Wallet.builder()
                .walletId("W123")
                .userId(1L)
                .balance(new BigDecimal("1000.00"))
                .currency("INR")
                .isFrozen(false)
                .build();

        walletLimit = WalletLimit.builder()
                .userId(1L)
                .dailyTopUpLimit(new BigDecimal("10000.00"))
                .dailyTransferLimit(new BigDecimal("5000.00"))
                .topUpToday(BigDecimal.ZERO)
                .transfersToday(BigDecimal.ZERO)
                .transferCountToday(0)
                .maxTransfersPerDay(10)
                .lastResetDate(LocalDate.now())
                .build();

        userDto = UserDto.builder()
                .id(1L)
                .kycApproved(true)
                .build();
    }

    @Test
    void testCreateWallet_Success() {
        CreateWalletRequest request = new CreateWalletRequest();
        request.setUserId(1L);
        request.setInitialBalance(new BigDecimal("500.00"));
        request.setCurrency("INR");

        when(userClient.getUserById(1L)).thenReturn(userDto);
        when(walletRepository.existsByUserId(1L)).thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenReturn(wallet);
        when(walletLimitRepository.save(any(WalletLimit.class))).thenReturn(walletLimit);

        WalletDTO result = walletService.createWallet(request);

        assertNotNull(result);
        verify(walletRepository, times(1)).save(any(Wallet.class));
        verify(ledgerRepository, times(1)).save(any());
    }

    @Test
    void testCreateWallet_KycNotApproved() {
        userDto.setKycApproved(false);
        CreateWalletRequest request = new CreateWalletRequest();
        request.setUserId(1L);

        when(userClient.getUserById(1L)).thenReturn(userDto);

        assertThrows(RuntimeException.class, () -> walletService.createWallet(request));
    }

    @Test
    void testDebit_Success() {
        WalletOperationRequest request = new WalletOperationRequest();
        request.setUserId(1L);
        request.setAmount(new BigDecimal("200.00"));

        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
        when(walletLimitRepository.findByUserId(1L)).thenReturn(Optional.of(walletLimit));

        WalletDTO result = walletService.debit(request);

        assertEquals(new BigDecimal("800.00"), wallet.getBalance());
        verify(walletRepository, times(1)).save(wallet);
        verify(ledgerRepository, times(1)).save(any());
    }

    @Test
    void testDebit_InsufficientBalance() {
        WalletOperationRequest request = new WalletOperationRequest();
        request.setUserId(1L);
        request.setAmount(new BigDecimal("2000.00"));

        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));

        assertThrows(RuntimeException.class, () -> walletService.debit(request));
    }

    @Test
    void testCredit_Success() {
        WalletOperationRequest request = new WalletOperationRequest();
        request.setUserId(1L);
        request.setAmount(new BigDecimal("300.00"));

        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
        when(walletLimitRepository.findByUserId(1L)).thenReturn(Optional.of(walletLimit));

        WalletDTO result = walletService.credit(request);

        assertEquals(new BigDecimal("1300.00"), wallet.getBalance());
        verify(walletRepository, times(1)).save(wallet);
    }
}
