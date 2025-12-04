package com.hostel.hostel_backend.util;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.text.DecimalFormat;

@Component
public class PayHereUtil {

    public String generateHash(String merchantId, String orderId, Double amount, String currency, String merchantSecret) {
        DecimalFormat df = new DecimalFormat("0.00");
        String formattedAmount = df.format(amount);
        String strToHash = merchantId + orderId + formattedAmount + currency + getMd5(merchantSecret).toUpperCase();
        return getMd5(strToHash).toUpperCase();
    }

    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating MD5", e);
        }
    }
}