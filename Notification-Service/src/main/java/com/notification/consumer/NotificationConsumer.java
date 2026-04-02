package com.notification.consumer;

import com.notification.config.RabbitConfig;
import com.notification.dto.SendNotificationRequest;
import com.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void consumeNotification(SendNotificationRequest request) {
        System.out.println("DEBUG: Consumed notification message: " + request);
        notificationService.sendNotification(request);
    }
}
