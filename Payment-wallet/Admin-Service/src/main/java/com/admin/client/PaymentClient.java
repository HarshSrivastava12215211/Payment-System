package com.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "Payment-Service")
public interface PaymentClient {

    @GetMapping("/api/payments/status")
    String getStatus(); // Placeholder for payment service health/status
}
