package com.notification.consumer;

import com.notification.config.RabbitConfig;
import com.notification.dto.PaymentCompletedEvent;
import com.notification.dto.SendNotificationRequest;
import com.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentCompletedConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitConfig.PAYMENT_QUEUE)
    public void consumePaymentEvent(PaymentCompletedEvent event) {
        log.info("Consumed PaymentCompletedEvent for transaction: {}", event.getTransactionId());
        
        try {
            // In a real system, we'd fetch the user's email from the User-Service here
            // For now, we'll send a generic notification or assume the service handles mapping
            
            String message = String.format("Successful payment of %s for transaction %s at %s", 
                    event.getAmount(), event.getTransactionId(), event.getTimestamp());
            
            notificationService.sendNotification(SendNotificationRequest.builder()
                    .userId(Long.parseLong(event.getUserId()))
                    .type("EMAIL")

                    .channel("TRANSACTION")
                    .subject("Payment Successful")
                    .message(message)
                    // .recipientEmail("user@example.com") // Would be fetched dynamically
                    .build());
            
            log.info("Successfully sent notification for transaction: {}", event.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to process payment notification for transaction: {}. Error: {}", 
                    event.getTransactionId(), e.getMessage());
        }
    }
}
