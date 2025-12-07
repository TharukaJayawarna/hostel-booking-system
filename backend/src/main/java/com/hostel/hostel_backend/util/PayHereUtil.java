package com.hostel.hostel_backend.util;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.util.Locale;

@Component
public class PayHereUtil {

    public String generateHash(String merchantId, String orderId, Double amount, String currency, String merchantSecret) {
        // 1. මුදල හරියටම දශමස්ථාන 2කට ෆෝමැට් කිරීම (1000.0 -> "1000.00")
        // Locale.US දැමීමෙන් දශම තිත (.) අනිවාර්ය කෙරේ.
        String formattedAmount = String.format(Locale.US, "%.2f", amount);

        // 2. Hash String එක සෑදීම (MerchantID + OrderID + Amount + Currency + Hash(Secret))
        // වැදගත්: Secret එක MD5 කර UpperCase කළ යුතුයි.
        String strToHash = merchantId + orderId + formattedAmount + currency + getMd5(merchantSecret).toUpperCase();

        // 3. සම්පූර්ණ String එක Hash කර UpperCase කර යැවීම
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