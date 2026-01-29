package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.dto.IssueDTO;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final EmailProducer emailProducer;
    private final EmailService emailService;

    @Value("${admin.email}")
    private String adminEmail;

    @Override
    public void reportIssue(IssueDTO dto) {
        String subject = "New Issue Reported: " + dto.getStudentName();

        Map<String, Object> variables = new HashMap<>();
        variables.put("studentName", dto.getStudentName());
        variables.put("studentId", dto.getStudentId());
        variables.put("studentPhone", dto.getStudentPhone());
        variables.put("studentEmail", dto.getStudentEmail());

        variables.put("checkIn", String.valueOf(dto.getCheckinDate()));
        variables.put("checkOut", String.valueOf(dto.getCheckoutDate()));
        variables.put("duration", dto.getDuration());
        variables.put("bank", dto.getBank());
        variables.put("paymentDate", String.valueOf(dto.getPaymentDoneDate()));
        variables.put("cardLastFour", dto.getCardLastFour());

        variables.put("comment", dto.getComment() != null ? dto.getComment().replace("\n", "<br/>") : "No description provided.");

        String body = emailService.getHtmlContent("issue-report", variables);

        emailProducer.sendEmail(adminEmail, subject, body);
    }
}