package com.hostel.hostel_backend.service;

import java.util.Map;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    String getHtmlContent(String templateName, Map<String, Object> variables);
}
