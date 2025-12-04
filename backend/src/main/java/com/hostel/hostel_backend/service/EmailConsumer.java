package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.config.RabbitMQConfig;
import com.hostel.hostel_backend.controller.dto.EmailDTO;
import com.hostel.hostel_backend.service.impl.EmailServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailConsumer {

    private final EmailServiceImpl realEmailSenderService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void receiveMessage(EmailDTO emailDTO) {
        try {
            System.out.println("Processing email for: " + emailDTO.getTo());

            // ඇත්තටම යවන්න ට්‍රයි කරනවා
            realEmailSenderService.sendEmail(emailDTO.getTo(), emailDTO.getSubject(), emailDTO.getBody());

            System.out.println("Email Sent Successfully to: " + emailDTO.getTo());

        } catch (Exception e) {
            System.err.println("Email sending failed (Connection Issue?). Re-queueing message...");
            // Exception එකක් විසි කළාම RabbitMQ එක මේක ආපහු Queue එකට දානවා
            throw new RuntimeException("Re-queue message due to failure");
        }
    }
}