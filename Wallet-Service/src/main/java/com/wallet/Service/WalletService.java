package com.wallet.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.wallet.client.UserClient;
import com.wallet.dto.*;
import com.wallet.entity.LedgerEntry;
import com.wallet.entity.Wallet;
import com.wallet.entity.WalletLimit;
import com.wallet.repository.LedgerRepository;
import com.wallet.repository.WalletLimitRepository;
import com.wallet.repository.WalletRepository;

import jakarta.transaction.Transactional;

@Service
public class WalletService {
    private static final String DEFAULT_CURRENCY = "INR";

    private final WalletRepository walletRepository;
    private final UserClient userClient;
    private final LedgerRepository ledgerRepository;
    private final WalletLimitRepository walletLimitRepository;

    public WalletService(WalletRepository walletRepository, UserClient userClient,
                         LedgerRepository ledgerRepository, WalletLimitRepository walletLimitRepository) {
        this.walletRepository = walletRepository;
        this.userClient = userClient;
        this.ledgerRepository = ledgerRepository;
        this.walletLimitRepository = walletLimitRepository;
    }

    @Transactional
    public WalletDTO createWallet(CreateWalletRequest create) {
        UserDto user = fetchAndValidateUser(create.getUserId());

        if (walletRepository.existsByUserId(create.getUserId())) {
            throw new RuntimeException("Wallet already exist for this user");
        }

        Wallet wallet = Wallet.builder()
                .userId(create.getUserId())
                .balance(create.getInitialBalance())
                .currency(resolveCurrency(create.getCurrency()))
                .isFrozen(false)
                .build();

        wallet = walletRepository.save(wallet);

        // Create default wallet limits
        WalletLimit limit = WalletLimit.builder()
                .userId(create.getUserId())
                .build();
        walletLimitRepository.save(limit);

        // Create initial ledger entry if balance > 0
        if (create.getInitialBalance() != null && create.getInitialBalance().compareTo(BigDecimal.ZERO) > 0) {
            createLedgerEntry(wallet.getWalletId(), create.getUserId(), "CREDIT",
                    create.getInitialBalance(), wallet.getBalance(),
                    "Initial wallet balance", null, "TOPUP");
        }

        return mapToDto(wallet);
    }

    @Transactional
    public WalletDTO getBalance(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultWallet(userId, DEFAULT_CURRENCY));
        return mapToDto(wallet);
    }

    @Transactional
    public WalletDTO debit(WalletOperationRequest request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.isFrozen()) {
            throw new RuntimeException("Wallet is frozen");
        }

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Check transfer limits
        checkTransferLimit(request.getUserId(), request.getAmount());

        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        // Create ledger entry
        createLedgerEntry(wallet.getWalletId(), request.getUserId(), "DEBIT",
                request.getAmount(), wallet.getBalance(),
                "Wallet debit", null, "TRANSFER");

        // Update daily transfer tracking
        updateTransferTracking(request.getUserId(), request.getAmount());

        return mapToDto(wallet);
    }

    @Transactional
    public WalletDTO credit(WalletOperationRequest request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseGet(() -> createDefaultWallet(request.getUserId(), request.getCurrency()));

        if (wallet.isFrozen()) {
            throw new RuntimeException("Wallet is frozen");
        }

        // Check top-up limits
        checkTopUpLimit(request.getUserId(), request.getAmount());

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        // Create ledger entry
        createLedgerEntry(wallet.getWalletId(), request.getUserId(), "CREDIT",
                request.getAmount(), wallet.getBalance(),
                "Wallet credit", null, "TOPUP");

        // Update daily top-up tracking
        updateTopUpTracking(request.getUserId(), request.getAmount());

        return mapToDto(wallet);
    }

    private Wallet createDefaultWallet(Long userId, String currency) {
        UserDto user = fetchAndValidateUser(userId);
        Wallet wallet = Wallet.builder()
                .userId(user.getId())
                .balance(BigDecimal.ZERO)
                .currency(resolveCurrency(currency))
                .isFrozen(false)
                .build();
        Wallet savedWallet = walletRepository.save(wallet);

        walletLimitRepository.findByUserId(userId).orElseGet(() -> walletLimitRepository.save(
                WalletLimit.builder().userId(userId).build()
        ));

        return savedWallet;
    }

    private UserDto fetchAndValidateUser(Long userId) {
        try {
            UserDto user = userClient.getUserById(userId);
            if (!user.isKycApproved()) {
                throw new RuntimeException("KYC is not approved for this user. Wallet cannot be created.");
            }
            if (user.isBlocked()) {
                throw new RuntimeException("User account is blocked. Wallet operations are not allowed.");
            }
            return user;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("User not found in User Service");
        }
    }

    private String resolveCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return DEFAULT_CURRENCY;
        }
        return currency.toUpperCase();
    }

    @Transactional
    public void freezeWallet(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setFrozen(true);
        walletRepository.save(wallet);
    }

    @Transactional
    public void unfreezeWallet(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setFrozen(false);
        walletRepository.save(wallet);
    }

    // ========================
    // LEDGER
    // ========================

    public List<LedgerEntryDTO> getLedger(Long userId) {
        return ledgerRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToLedgerDTO)
                .collect(Collectors.toList());
    }

    public List<LedgerEntryDTO> getLedgerByType(Long userId, String referenceType) {
        return ledgerRepository.findByUserIdAndReferenceType(userId, referenceType).stream()
                .map(this::mapToLedgerDTO)
                .collect(Collectors.toList());
    }

    // ========================
    // LIMITS
    // ========================

    public WalletLimitDTO getWalletLimits(Long userId) {
        WalletLimit limit = getOrCreateLimit(userId);
        resetLimitIfNewDay(limit);
        return mapToLimitDTO(limit);
    }

    // ========================
    // STATEMENT EXPORT (CSV)
    // ========================

    public byte[] exportStatementCsv(Long userId) {
        List<LedgerEntry> entries = ledgerRepository.findByUserIdOrderByCreatedAtDesc(userId);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("ID,Date,Type,Amount,Balance After,Description,Reference Type,Reference ID");
        for (LedgerEntry e : entries) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    e.getId(),
                    e.getCreatedAt() != null ? e.getCreatedAt().toString() : "",
                    e.getType(),
                    e.getAmount(),
                    e.getBalanceAfter(),
                    e.getDescription() != null ? e.getDescription().replace(",", " ") : "",
                    e.getReferenceType() != null ? e.getReferenceType() : "",
                    e.getReferenceId() != null ? e.getReferenceId() : "");
        }
        writer.flush();
        return out.toByteArray();
    }

    // ========================
    // HELPERS
    // ========================

    private void createLedgerEntry(String walletId, Long userId, String type,
                                    BigDecimal amount, BigDecimal balanceAfter,
                                    String description, String referenceId, String referenceType) {
        LedgerEntry entry = LedgerEntry.builder()
                .walletId(walletId)
                .userId(userId)
                .type(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .description(description)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        ledgerRepository.save(entry);
    }

    private void checkTopUpLimit(Long userId, BigDecimal amount) {
        WalletLimit limit = getOrCreateLimit(userId);
        resetLimitIfNewDay(limit);

        BigDecimal newTotal = limit.getTopUpToday().add(amount);
        if (newTotal.compareTo(limit.getDailyTopUpLimit()) > 0) {
            throw new RuntimeException("Daily top-up limit of " + limit.getDailyTopUpLimit()
                    + " exceeded. Used today: " + limit.getTopUpToday());
        }
    }

    private void checkTransferLimit(Long userId, BigDecimal amount) {
        WalletLimit limit = getOrCreateLimit(userId);
        resetLimitIfNewDay(limit);

        BigDecimal newTotal = limit.getTransfersToday().add(amount);
        if (newTotal.compareTo(limit.getDailyTransferLimit()) > 0) {
            throw new RuntimeException("Daily transfer limit of " + limit.getDailyTransferLimit()
                    + " exceeded. Used today: " + limit.getTransfersToday());
        }

        if (limit.getTransferCountToday() >= limit.getMaxTransfersPerDay()) {
            throw new RuntimeException("Maximum transfers per day (" + limit.getMaxTransfersPerDay()
                    + ") exceeded.");
        }
    }

    private void updateTopUpTracking(Long userId, BigDecimal amount) {
        WalletLimit limit = getOrCreateLimit(userId);
        limit.setTopUpToday(limit.getTopUpToday().add(amount));
        walletLimitRepository.save(limit);
    }

    private void updateTransferTracking(Long userId, BigDecimal amount) {
        WalletLimit limit = getOrCreateLimit(userId);
        limit.setTransfersToday(limit.getTransfersToday().add(amount));
        limit.setTransferCountToday(limit.getTransferCountToday() + 1);
        walletLimitRepository.save(limit);
    }

    private WalletLimit getOrCreateLimit(Long userId) {
        return walletLimitRepository.findByUserId(userId)
                .orElseGet(() -> {
                    WalletLimit newLimit = WalletLimit.builder()
                            .userId(userId)
                            .build();
                    return walletLimitRepository.save(newLimit);
                });
    }

    private void resetLimitIfNewDay(WalletLimit limit) {
        if (!limit.getLastResetDate().equals(LocalDate.now())) {
            limit.setTopUpToday(BigDecimal.ZERO);
            limit.setTransfersToday(BigDecimal.ZERO);
            limit.setTransferCountToday(0);
            limit.setLastResetDate(LocalDate.now());
            walletLimitRepository.save(limit);
        }
    }

    // ========================
    // MAPPERS
    // ========================

    private WalletDTO mapToDto(Wallet wallet) {
        return WalletDTO.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .Currency(wallet.getCurrency())
                .isFrozen(wallet.isFrozen())
                .build();
    }

    private LedgerEntryDTO mapToLedgerDTO(LedgerEntry e) {
        return LedgerEntryDTO.builder()
                .id(e.getId())
                .walletId(e.getWalletId())
                .userId(e.getUserId())
                .type(e.getType())
                .amount(e.getAmount())
                .balanceAfter(e.getBalanceAfter())
                .description(e.getDescription())
                .referenceId(e.getReferenceId())
                .referenceType(e.getReferenceType())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }

    private WalletLimitDTO mapToLimitDTO(WalletLimit l) {
        return WalletLimitDTO.builder()
                .userId(l.getUserId())
                .dailyTopUpLimit(l.getDailyTopUpLimit())
                .dailyTransferLimit(l.getDailyTransferLimit())
                .maxTransfersPerDay(l.getMaxTransfersPerDay())
                .topUpToday(l.getTopUpToday())
                .transfersToday(l.getTransfersToday())
                .transferCountToday(l.getTransferCountToday())
                .lastResetDate(l.getLastResetDate().toString())
                .build();
    }
}
