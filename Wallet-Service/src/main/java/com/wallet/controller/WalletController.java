package com.wallet.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wallet.Service.WalletService;
import com.wallet.dto.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping
    public ResponseEntity<WalletDTO> createWallet(@Valid @RequestBody CreateWalletRequest request) {
        log.info("Creating wallet for user ID: {}", request.getUserId());
        WalletDTO wallet = walletService.createWallet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(wallet);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WalletDTO> getWallet(@PathVariable Long userId) {
        log.info("Fetching wallet for user ID: {}", userId);
        WalletDTO wallet = walletService.getBalance(userId);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/credit")
    public ResponseEntity<WalletDTO> credit(@Valid @RequestBody WalletOperationRequest request) {
        WalletDTO wallet = walletService.credit(request);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/debit")
    public ResponseEntity<WalletDTO> debit(@Valid @RequestBody WalletOperationRequest request) {
        WalletDTO wallet = walletService.debit(request);
        return ResponseEntity.ok(wallet);
    }

    @PutMapping("/{userId}/freeze")
    public ResponseEntity<String> freezeWallet(@PathVariable Long userId) {
        walletService.freezeWallet(userId);
        return ResponseEntity.ok("Wallet frozen successfully");
    }

    @PutMapping("/{userId}/unfreeze")
    public ResponseEntity<String> unfreezeWallet(@PathVariable Long userId) {
        walletService.unfreezeWallet(userId);
        return ResponseEntity.ok("Wallet unfrozen successfully");
    }

    // ========================
    // LEDGER
    // ========================

    @GetMapping("/{userId}/ledger")
    public ResponseEntity<List<LedgerEntryDTO>> getLedger(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getLedger(userId));
    }

    @GetMapping("/{userId}/ledger/filter")
    public ResponseEntity<List<LedgerEntryDTO>> getLedgerByType(
            @PathVariable Long userId,
            @RequestParam String referenceType) {
        return ResponseEntity.ok(walletService.getLedgerByType(userId, referenceType));
    }

    // ========================
    // LIMITS
    // ========================

    @GetMapping("/{userId}/limits")
    public ResponseEntity<WalletLimitDTO> getWalletLimits(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWalletLimits(userId));
    }

    // ========================
    // STATEMENTS
    // ========================

    @GetMapping("/{userId}/statement/csv")
    public ResponseEntity<byte[]> exportStatementCsv(@PathVariable Long userId) {
        byte[] csv = walletService.exportStatementCsv(userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "statement_" + userId + ".csv");
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }
}
