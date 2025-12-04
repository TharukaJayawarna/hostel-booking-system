package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateIssueRequestDTO;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    @Autowired
    private EmailService emailService;

    @Value("${admin.email}")
    private String adminEmail;

    public void reportIssue(CreateIssueRequestDTO dto) {

        String subject = "New Hostel Issue - Student ID: " + dto.getStudentId();

        String body = "You have received a new issue report.\n\n" +
                "=== Student Details ===\n" +
                "Name: " + dto.getStudentName() + "\n" +
                "Registration No: " + dto.getStudentId() + "\n" +
                "Student Email: " + dto.getStudentEmail() + "\n" +
                "Phone: " + dto.getStudentPhone() + "\n\n" +

                "=== Reservation Details ===\n" +
                "Check-in: " + dto.getCheckinDate() + "\n" +
                "Check-out: " + dto.getCheckoutDate() + "\n" +
                "Duration: " + dto.getDuration() + "\n\n" +

                "=== Payment Info ===\n" +
                "Bank: " + dto.getBank() + "\n" +
                "Payment Date: " + dto.getPaymentDoneDate() + "\n\n" +

                "=== ISSUE DESCRIPTION ===\n" +
                dto.getComment() + "\n\n" +

                "--------------------------------------------------\n" +
                "Please contact the student via " + dto.getStudentEmail() + " if necessary.";

        emailService.sendEmail(adminEmail, subject, body);
    }

}
