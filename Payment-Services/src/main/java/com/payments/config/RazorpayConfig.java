package com.payments.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class RazorpayConfig {

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            return new RazorpayClient(apiKey, apiSecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client. Check razorpay.api.key and razorpay.api.secret. Error: {}", e.getMessage());
            return null; // Bean will be null; controller handles NullPointerException
        }
    }
}
