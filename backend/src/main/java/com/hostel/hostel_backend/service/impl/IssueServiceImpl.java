package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.dto.IssueDTO;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final EmailProducer emailProducer;

    @Value("${admin.email}")
    private String adminEmail;

    @Override
    public void reportIssue(IssueDTO dto) {
        String subject = "New Issue Reported: " + dto.getStudentName();

        StringBuilder contentBuilder = new StringBuilder();

        // Intro Text
        contentBuilder.append("<p style='font-size: 15px; color: #475569; margin-bottom: 25px;'>A student has reported an issue regarding their hostel reservations. Here are the details:</p>");

        // --- SECTION 1: STUDENT INFO ---
        contentBuilder.append("<div style='background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;'>");
        contentBuilder.append("<h3 style='margin: 0 0 15px 0; font-size: 14px; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;'>Student Information</h3>");

        addField(contentBuilder, "Student Name", dto.getStudentName());
        addField(contentBuilder, "Registration No", dto.getStudentId());
        addField(contentBuilder, "Phone Number", dto.getStudentPhone());
        addField(contentBuilder, "Email", dto.getStudentEmail());
        contentBuilder.append("</div>");

        // --- SECTION 2: BOOKING & PAYMENT ---
        contentBuilder.append("<div style='background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;'>");
        contentBuilder.append("<h3 style='margin: 0 0 15px 0; font-size: 14px; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;'>Booking & Payment</h3>");

        addField(contentBuilder, "Check-in Date", String.valueOf(dto.getCheckinDate()));
        addField(contentBuilder, "Check-out Date", String.valueOf(dto.getCheckoutDate()));
        addField(contentBuilder, "Duration", dto.getDuration());
        addField(contentBuilder, "Payment Method", dto.getBank());
        addField(contentBuilder, "Payment Date", String.valueOf(dto.getPaymentDoneDate()));
        addField(contentBuilder, "Card Ref (Last 4)", dto.getCardLastFour());
        contentBuilder.append("</div>");

        // --- SECTION 3: THE ISSUE ---
        contentBuilder.append("<div style='margin-top: 25px;'>");
        contentBuilder.append("<h3 style='color: #be123c; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;'>⚠️ Issue Description</h3>");
        contentBuilder.append("<div style='background-color: #fff1f2; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; color: #881337; line-height: 1.6; font-size: 15px;'>");
        contentBuilder.append(dto.getComment() != null ? dto.getComment().replace("\n", "<br/>") : "No description provided.");
        contentBuilder.append("</div>");
        contentBuilder.append("</div>");

        // Generate Final Template
        String body = generateCleanTemplate("Issue Report 🛠️", contentBuilder.toString());

        emailProducer.sendEmail(adminEmail, subject, body);
    }

    // Helper method to create a clean Field-Value pair
    private void addField(StringBuilder sb, String label, String value) {
        sb.append("<div style='margin-bottom: 12px;'>");
        sb.append("<span style='display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;'>").append(label).append("</span>");
        sb.append("<span style='display: block; font-size: 15px; font-weight: 500; color: #1e293b; margin-top: 2px;'>").append(value != null && !value.isEmpty() ? value : "-").append("</span>");
        sb.append("</div>");
    }

    // A Simplified, Cleaner Main Template
    private String generateCleanTemplate(String title, String content) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style='font-family: \"Inter\", \"Segoe UI\", Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 0;'>" +
                "  <div style='max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;'>" +

                // Simple Clean Header
                "    <div style='background-color: #ffffff; padding: 30px 30px 10px 30px; border-bottom: 1px solid #f1f5f9;'>" +
                "      <h1 style='color: #1e293b; margin: 0; font-size: 24px; font-weight: 800;'>" + title + "</h1>" +
                "    </div>" +

                // Content
                "    <div style='padding: 30px; color: #334155; line-height: 1.5;'>" +
                content +
                "    </div>" +

                // Minimal Footer
                "    <div style='background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;'>" +
                "      <p style='margin: 0; color: #94a3b8; font-size: 12px;'>Hostel Management System • Admin Notification</p>" +
                "    </div>" +

                "  </div>" +
                "</body>" +
                "</html>";
    }
}