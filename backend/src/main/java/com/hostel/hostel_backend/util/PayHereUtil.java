package com.hostel.hostel_backend.util;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.util.Locale;

@Component
public class PayHereUtil {

    // 1. Payment Form එක සදහා (Frontend එකට යවන Hash එක) - මෙය වෙනස් නොකරන්න
    public String generateHash(String merchantId, String orderId, Double amount, String currency, String merchantSecret) {
        String formattedAmount = String.format(Locale.US, "%.2f", amount);
        String strToHash = merchantId + orderId + formattedAmount + currency + getMd5(merchantSecret).toUpperCase();
        return getMd5(strToHash).toUpperCase();
    }

    // 2. [NEW] Notify Request එක Validate කිරීම සදහා (Status Code එක සහිතව)
    public String generateNotifyHash(String merchantId, String orderId, Double amount, String currency, String statusCode, String merchantSecret) {
        String formattedAmount = String.format(Locale.US, "%.2f", amount);
        // Notify Hash එකේදී Currency එකට පසුව Status Code එක එකතු විය යුතුයි
        String strToHash = merchantId + orderId + formattedAmount + currency + statusCode + getMd5(merchantSecret).toUpperCase();
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