import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldQuestion
} from "lucide-react";
import "../../components/styles/ForgotPassword.css";

// Service import
import authService from "../../services/auth.service";

const ForgotPassword = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      notify.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to find account.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleReset = async (e) => {
    e.preventDefault();
    
    if (otp.length < 4) {
      notify.error("Please enter a valid OTP.");
      return;
    }
    if (newPassword.length < 8) {
      notify.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      notify.success("Password changed successfully! Please login.");
      navigate("/login");
    } catch (error) {
      notify.error(error.response?.data?.message || "Invalid OTP or Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        
        {/* Header Icon */}
        <div className="fp-icon-wrapper">
          <ShieldQuestion size={40} color="#4f46e5" />
        </div>

        {step === 1 ? (
          /* --- STEP 1: EMAIL INPUT --- */
          <form onSubmit={handleSendOtp}>
            <h2 className="fp-title">Forgot Password?</h2>
            <p className="fp-subtitle">
              No worries! Enter your email address below and we will send you a code to reset your password.
            </p>

            <div className="fp-input-group">
              <label className="fp-label">Email Address</label>
              <div className="fp-input-wrapper">
                <div className="fp-input-icon"><Mail size={18} /></div>
                <input
                  type="email"
                  className="fp-input"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="fp-btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Code <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          /* --- STEP 2: OTP & NEW PASSWORD --- */
          <form onSubmit={handleReset}>
            <h2 className="fp-title">Reset Password</h2>
            <p className="fp-subtitle">
              We have sent a code to <span className="highlight-email">{email}</span>.
              Please enter it below to verify.
            </p>

            {/* OTP Input */}
            <div className="fp-input-group">
              <label className="fp-label">Verification Code (OTP)</label>
              <div className="fp-input-wrapper">
                <div className="fp-input-icon"><KeyRound size={18} /></div>
                <input
                  type="text"
                  className="fp-input otp-tracking" // spaced text for OTP
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            {/* New Password Input */}
            <div className="fp-input-group">
              <label className="fp-label">New Password</label>
              <div className="fp-input-wrapper">
                <div className="fp-input-icon"><Lock size={18} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="fp-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="fp-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="fp-btn-primary success-theme" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Reset Password <CheckCircle2 size={18} /></>}
            </button>
          </form>
        )}

        {/* Footer Actions */}
        <div className="fp-footer">
          <button className="fp-back-link" onClick={() => navigate("/login")}>
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;