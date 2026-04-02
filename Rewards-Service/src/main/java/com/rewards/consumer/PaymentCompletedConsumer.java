package com.rewards.consumer;

import com.rewards.dto.EarnPointsRequest;
import com.rewards.dto.PaymentCompletedEvent;
import com.rewards.service.RewardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentCompletedConsumer {

    private final RewardService rewardService;

    @RabbitListener(queues = "payment.completed.rewards")
    public void consumePaymentEvent(PaymentCompletedEvent event) {
        log.info("Consumed PaymentCompletedEvent for transaction: {}", event.getTransactionId());
        
        try {
            rewardService.earnPoints(EarnPointsRequest.builder()
                    .userId(Long.parseLong(event.getUserId()))
                    .transactionAmount(event.getAmount())
                    .transactionType("PAYMENT")
                    .transactionId(event.getTransactionId())
                    .build());
            log.info("Successfully processed rewards for transaction: {}", event.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to process rewards for transaction: {}. Error: {}", event.getTransactionId(), e.getMessage());
        }
    }
}
