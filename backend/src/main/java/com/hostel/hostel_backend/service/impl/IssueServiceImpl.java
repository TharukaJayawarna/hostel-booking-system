package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.dto.IssueDTO;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final EmailProducer emailProducer;

    @Value("${admin.email}")
    private String adminEmail;

    @Override
    public void reportIssue(IssueDTO dto) {
        String subject = "New Issue Report: " + dto.getStudentId() + " - " + dto.getStudentName();

        // ඊමේල් අන්තර්ගතය (Content) ගොඩනැගීම
        StringBuilder contentBuilder = new StringBuilder();

        contentBuilder.append("<p style='font-size: 16px; margin-bottom: 20px;'>You have received a new issue report with the following details:</p>");

        // --- DETAILS TABLE START ---
        contentBuilder.append("<table style='width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;'>");

        // Student Info Section
        addSectionHeader(contentBuilder, "Student Information");
        addRow(contentBuilder, "Student Name", dto.getStudentName());
        addRow(contentBuilder, "Registration No", dto.getStudentId());
        addRow(contentBuilder, "Email Address", dto.getStudentEmail());
        addRow(contentBuilder, "Contact Number", dto.getStudentPhone());

        // Booking Info Section
        addSectionHeader(contentBuilder, "Booking Details");
        addRow(contentBuilder, "Duration", dto.getDuration());
        addRow(contentBuilder, "Check-in Date", String.valueOf(dto.getCheckinDate()));
        addRow(contentBuilder, "Check-out Date", String.valueOf(dto.getCheckoutDate()));

        // Payment Info Section
        addSectionHeader(contentBuilder, "Payment Information");
        addRow(contentBuilder, "Bank / Method", dto.getBank());
        addRow(contentBuilder, "Payment Date", String.valueOf(dto.getPaymentDoneDate()));
        addRow(contentBuilder, "Card (Last 4 Digits)", dto.getCardLastFour());

        contentBuilder.append("</table>");
        // --- DETAILS TABLE END ---

        // --- COMMENT SECTION ---
        contentBuilder.append("<div style='margin-top: 25px;'>");
        contentBuilder.append("<h3 style='color: #be123c; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;'>⚠️ Issue Description</h3>");
        contentBuilder.append("<div style='background-color: #fff1f2; border: 1px solid #fda4af; border-left: 4px solid #e11d48; padding: 15px; border-radius: 6px; color: #881337; font-style: italic; line-height: 1.6;'>");
        contentBuilder.append(dto.getComment() != null ? dto.getComment().replace("\n", "<br/>") : "No description provided.");
        contentBuilder.append("</div>");
        contentBuilder.append("</div>");

        // --- ACTION BUTTON ---
        contentBuilder.append("<div style='margin-top: 30px; text-align: center;'>");
        contentBuilder.append("<a href='mailto:").append(dto.getStudentEmail()).append("' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;'>Reply to Student</a>");
        contentBuilder.append("</div>");

        // අවසාන ඊමේල් එක සෑදීම
        String body = generateHighQualityTemplate("New Issue Reported 🛠️", contentBuilder.toString());

        emailProducer.sendEmail(adminEmail, subject, body);
    }

    // වගුවට පේළියක් එකතු කරන Helper Method එක
    private void addRow(StringBuilder sb, String label, String value) {
        sb.append("<tr>");
        sb.append("<td style='padding: 12px 15px; border-bottom: 1px solid #f3f4f6; background-color: #f9fafb; width: 35%; font-weight: 600; color: #4b5563;'>").append(label).append("</td>");
        sb.append("<td style='padding: 12px 15px; border-bottom: 1px solid #f3f4f6; color: #1f2937;'>").append(value != null && !value.isEmpty() ? value : "<span style='color:#9ca3af'>N/A</span>").append("</td>");
        sb.append("</tr>");
    }

    // වගුවට Section Header එකක් එකතු කරන Helper Method එක
    private void addSectionHeader(StringBuilder sb, String title) {
        sb.append("<tr>");
        sb.append("<td colspan='2' style='padding: 10px 15px; background-color: #e0e7ff; color: #3730a3; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #c7d2fe;'>").append(title).append("</td>");
        sb.append("</tr>");
    }

    // --- HIGH QUALITY EMAIL TEMPLATE ---
    private String generateHighQualityTemplate(String title, String content) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style='font-family: \"Segoe UI\", Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 0;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;'>" +

                // Header Gradient
                "    <div style='background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); padding: 35px 30px; text-align: center;'>" +
                "      <h1 style='color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;'>Hostel PMS</h1>" +
                "      <p style='color: #a5b4fc; margin: 5px 0 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;'>Admin Notification System</p>" +
                "    </div>" +

                // Main Content Area
                "    <div style='padding: 40px 30px; color: #334155; line-height: 1.6;'>" +
                "      <div style='border-bottom: 2px solid #f1f5f9; margin-bottom: 25px; padding-bottom: 15px; display: flex; align-items: center;'>" +
                "        <h2 style='color: #1e293b; margin: 0; font-size: 22px; font-weight: 700;'>" + title + "</h2>" +
                "      </div>" +
                "      <div style='font-size: 15px;'>" + content + "</div>" +
                "    </div>" +

                // Footer
                "    <div style='background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;'>" +
                "      <p style='margin: 0; color: #64748b; font-size: 12px; font-weight: 600;'>&copy; 2025 Hostel Management System</p>" +
                "      <p style='margin: 5px 0 0; color: #94a3b8; font-size: 11px;'>This is an automated system email. Please perform the necessary actions in the admin dashboard.</p>" +
                "    </div>" +

                "  </div>" +
                "</body>" +
                "</html>";
    }
}