package com.admin.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/fallback/payment")
    public Mono<Map<String, Object>> paymentFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "Payment Service is temporarily unavailable. Please try again later.");
        return Mono.just(response);
    }

    @GetMapping("/fallback/reward")
    public Mono<Map<String, Object>> rewardFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "Rewards Service is temporarily unavailable. Please try again later.");
        return Mono.just(response);
    }

    @GetMapping("/fallback/general")
    public Mono<Map<String, Object>> generalFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "Service is temporarily unavailable. Please try again later.");
        return Mono.just(response);
    }
}
