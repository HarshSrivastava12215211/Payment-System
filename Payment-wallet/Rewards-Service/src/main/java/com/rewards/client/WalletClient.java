package com.rewards.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.rewards.dto.WalletOperationRequest;

@FeignClient(name = "Wallet-Service")
public interface WalletClient {

    @PostMapping("/api/wallets/credit")
    Object credit(@RequestBody WalletOperationRequest request);
}
