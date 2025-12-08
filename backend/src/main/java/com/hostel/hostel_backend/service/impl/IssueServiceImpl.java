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
        // ඊමේල් මාතෘකාව (Subject)
        String subject = "Action Required: Issue Reported by " + dto.getStudentName();

        // ඊමේල් අන්තර්ගතය ගොඩනැගීම (Body Construction)
        StringBuilder bodyContent = new StringBuilder();

        bodyContent.append("<p style='color: #374151; font-size: 16px; margin-bottom: 25px;'>A new issue has been submitted through the student portal. Please review the details below.</p>");

        // --- 1. ISSUE SUMMARY (Highlighted Box) ---
        bodyContent.append("<div style='background-color: #fff1f2; border-left: 5px solid #e11d48; padding: 20px; border-radius: 4px; margin-bottom: 35px;'>");
        bodyContent.append("<h3 style='color: #9f1239; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;'>Reported Issue</h3>");
        bodyContent.append("<p style='color: #881337; font-size: 16px; font-style: italic; margin: 8px 0 0; line-height: 1.6;'>")
                .append(dto.getComment() != null ? "\"" + dto.getComment().replace("\n", "<br/>") + "\"" : "No description provided.")
                .append("</p>");
        bodyContent.append("</div>");

        // --- 2. DETAILS GRID ---
        bodyContent.append("<table width='100%' cellpadding='0' cellspacing='0' style='min-width:100%; border-collapse: collapse;'>");

        // Student Details Section
        bodyContent.append(getSectionHeader("Student Profile"));
        bodyContent.append(getRow("Student Name", dto.getStudentName()));
        bodyContent.append(getRow("Registration ID", "<span style='font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;'>" + dto.getStudentId() + "</span>"));
        bodyContent.append(getRow("Email Address", "<a href='mailto:" + dto.getStudentEmail() + "' style='color:#2563eb; text-decoration:none; border-bottom: 1px dotted #2563eb;'>" + dto.getStudentEmail() + "</a>"));
        bodyContent.append(getRow("Contact Number", dto.getStudentPhone()));
        bodyContent.append("<tr><td colspan='2' height='25'></td></tr>"); // Spacer

        // Reservation Info Section
        bodyContent.append(getSectionHeader("Reservation Context"));
        bodyContent.append(getRow("Booking Duration", dto.getDuration()));
        bodyContent.append(getRow("Check-in Date", String.valueOf(dto.getCheckinDate())));
        bodyContent.append(getRow("Check-out Date", String.valueOf(dto.getCheckoutDate())));
        bodyContent.append("<tr><td colspan='2' height='25'></td></tr>"); // Spacer

        // Payment Info Section
        bodyContent.append(getSectionHeader("Payment Verification"));
        bodyContent.append(getRow("Payment Method", dto.getBank()));
        bodyContent.append(getRow("Date of Payment", String.valueOf(dto.getPaymentDoneDate())));
        bodyContent.append(getRow("Card Reference", "Ending in **** " + dto.getCardLastFour()));

        bodyContent.append("</table>");

        // --- 3. ACTION BUTTON ---
        bodyContent.append("<div style='margin-top: 45px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;'>");
        bodyContent.append("<p style='margin-bottom: 20px; color: #6b7280; font-size: 14px;'>You can reply directly to the student by clicking below:</p>");
        bodyContent.append("<a href='mailto:").append(dto.getStudentEmail()).append("?subject=Regarding your issue report (Ref: ").append(dto.getStudentId()).append(")' style='background-color: #111827; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background-color 0.2s;'>Reply to Student</a>");
        bodyContent.append("</div>");

        // අවසාන HTML එක සෑදීම
        String fullBody = generateProfessionalTemplate(bodyContent.toString());
        emailProducer.sendEmail(adminEmail, subject, fullBody);
    }

    // --- Helper Methods for Clean Code ---

    private String getRow(String label, String value) {
        return "<tr>" +
                "<td style='padding: 10px 0; width: 35%; color: #6b7280; font-size: 14px; font-weight: 500; vertical-align: top; border-bottom: 1px solid #f9fafb;'>" + label + "</td>" +
                "<td style='padding: 10px 0; width: 65%; color: #1f2937; font-size: 14px; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f9fafb;'>" + (value != null ? value : "-") + "</td>" +
                "</tr>";
    }

    private String getSectionHeader(String title) {
        return "<tr><td colspan='2' style='padding-bottom: 10px;'><h3 style='color: #111827; font-size: 16px; font-weight: 700; margin: 0; border-bottom: 2px solid #e5e7eb; display: inline-block; padding-bottom: 5px;'>" + title + "</h3></td></tr>";
    }

    // --- PROFESSIONAL TEMPLATE WRAPPER ---
    private String generateProfessionalTemplate(String content) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='utf-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "</head>" +
                "<body style='font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; -webkit-font-smoothing: antialiased;'>" +

                // Card Container
                "  <div style='max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);'>" +

                // 1. Professional Header (Dark Theme)
                "    <div style='background-color: #111827; padding: 30px 40px; border-bottom: 4px solid #4f46e5;'>" +
                "      <table width='100%'><tr>" +
                "        <td>" +
                "          <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;'>Hostel PMS</h1>" +
                "          <p style='color: #9ca3af; margin: 5px 0 0; font-size: 12px; font-weight: 500;'>Admin Notification System</p>" +
                "        </td>" +
                "        <td align='right'>" +
                "          <span style='background-color: #374151; color: #e5e7eb; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #4b5563;'>Issue Ticket</span>" +
                "        </td>" +
                "      </tr></table>" +
                "    </div>" +

                // 2. Main Content Area
                "    <div style='padding: 40px 40px 50px;'>" +
                content +
                "    </div>" +

                // 3. Footer
                "    <div style='background-color: #f9fafb; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; line-height: 1.5;'>" +
                "      <p style='margin: 0 0 10px;'>&copy; 2025 Hostel Management System. All rights reserved.</p>" +
                "      <p style='margin: 0;'>This email was generated automatically by the system.<br>Please log in to the admin dashboard to manage this ticket.</p>" +
                "    </div>" +

                "  </div>" +
                "</body>" +
                "</html>";
    }
}