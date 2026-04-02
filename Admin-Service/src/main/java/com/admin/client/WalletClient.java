package com.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "Wallet-Service")
public interface WalletClient {

    @PutMapping("/api/wallets/{userId}/freeze")
    void freezeWallet(@PathVariable("userId") Long userId);

    @PutMapping("/api/wallets/{userId}/unfreeze")
    void unfreezeWallet(@PathVariable("userId") Long userId);
}