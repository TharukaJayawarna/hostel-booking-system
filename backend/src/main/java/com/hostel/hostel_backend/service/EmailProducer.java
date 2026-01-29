package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.config.RabbitMQConfig;
import com.hostel.hostel_backend.controller.dto.EmailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendEmail(String to, String subject, String body) {
        EmailDTO emailDTO = new EmailDTO(to, subject, body);

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, emailDTO);

        System.out.println("Email Queued for: " + to);
    }
}