package com.payments.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.payments.dto.WalletDTO;
import com.payments.dto.WalletOperationRequest;
@FeignClient(name = "Wallet-Service", path = "/api/wallets")
public interface WalletClient {
	
	 @PostMapping("/debit")
	   WalletDTO debit(@RequestBody WalletOperationRequest request);

	    @PostMapping("/credit")
	    WalletDTO credit(@RequestBody WalletOperationRequest request);

	    @GetMapping("/{userId}")
	    WalletDTO getWallet(@PathVariable("userId") String userId);

}
