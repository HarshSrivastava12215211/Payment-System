package com.payments.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "payment.exchange";
    public static final String QUEUE_REWARDS = "payment.completed.rewards";
    public static final String QUEUE_NOTIFICATIONS = "payment.completed.notifications";
    public static final String ROUTING_KEY = "payment.completed";

    @Bean
    public Queue rewardsQueue() {
        return new Queue(QUEUE_REWARDS);
    }

    @Bean
    public Queue notificationsQueue() {
        return new Queue(QUEUE_NOTIFICATIONS);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding rewardsBinding(@Qualifier("rewardsQueue") Queue rewardsQueue, TopicExchange exchange) {
        return BindingBuilder.bind(rewardsQueue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding notificationsBinding(@Qualifier("notificationsQueue") Queue notificationsQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationsQueue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate template(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}
