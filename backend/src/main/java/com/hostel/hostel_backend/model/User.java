package com.hostel.hostel_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String password;
    private String email;
    private String contactNumber;
    private String role;

    // 1. OTP for Login (2FA)
    private String twoFactorOtp;
    private LocalDateTime twoFactorOtpGeneratedTime;

    // 2. OTP for Password Reset
    private String resetOtp;
    private LocalDateTime resetOtpGeneratedTime;

    @Column(columnDefinition = "boolean default true")
    private boolean twoFactorEnabled = true;

    private boolean isMfaEnabled = false;
    private String mfaSecret;

    @Column(columnDefinition = "integer default 0")
    private int failedOtpAttempts;

    @Column(columnDefinition = "integer default 0")
    private int failedLoginAttempts;
    private LocalDateTime accountLockTime;

    @OneToMany(mappedBy ="user",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reservation> reservations;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() {
        if (accountLockTime != null) {
            if (accountLockTime.isBefore(LocalDateTime.now())) {
                return true;
            }
            return false;
        }
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}