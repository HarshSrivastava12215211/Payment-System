package com.payments.publisher;

import com.payments.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;
    
    private static final String EXCHANGE = "notification.exchange";
    private static final String ROUTING_KEY = "notification.transaction";

    public void sendTransactionNotification(Long userId, String email, BigDecimal amount, String type, String status) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String message = String.format("Transaction of %s %s was %s at %s. Account involved: %d", 
                amount, type, status, currentTime, userId);
        
        NotificationEvent event = NotificationEvent.builder()
                .userId(userId)
                .type("EMAIL")
                .channel("TRANSACTION")
                .subject("Transaction Update")
                .message(message)
                .recipientEmail(email)
                .build();

        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, event);
        System.out.println("DEBUG: Published transaction notification for user ID: " + userId);
    }
}
