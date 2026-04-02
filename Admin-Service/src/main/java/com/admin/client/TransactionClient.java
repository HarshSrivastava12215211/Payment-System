package com.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.admin.dto.TransactionDto;

@FeignClient(name = "Transaction-Service")
public interface TransactionClient {

    @GetMapping("/api/transaction")
    List<TransactionDto> getAllTransactions();

    @GetMapping("/api/transaction/suspicious")
    List<TransactionDto> getSuspiciousTransactions();
}
