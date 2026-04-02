package com.user.publisher;

import com.user.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;
    
    private static final String EXCHANGE = "notification.exchange";
    private static final String ROUTING_KEY = "notification.login";

    public void sendLoginNotification(String email, Long userId) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        NotificationEvent event = NotificationEvent.builder()
                .userId(userId)
                .type("EMAIL")
                .channel("LOGIN")
                .subject("Login Notification")
                .message("Hello, a login has happened into your account at " + currentTime)
                .recipientEmail(email)
                .build();

        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, event);
        System.out.println("DEBUG: Published login notification for user: " + email);
    }
}
