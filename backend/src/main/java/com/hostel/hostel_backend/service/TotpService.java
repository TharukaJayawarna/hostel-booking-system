package com.hostel.hostel_backend.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TotpService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public GoogleAuthenticatorKey generateSecret() {
        return gAuth.createCredentials();
    }

    public String getQrCodeUrl(String secret, String username) {
        // App Name eka methana wenas karanna puluwan
        String issuer = "HostelPMS";

        // Google Authenticator expects: otpauth://totp/Issuer:Account?secret=...&issuer=...
        return String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer,
                username,
                secret,
                issuer
        );
    }

    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
}