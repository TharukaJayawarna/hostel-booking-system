import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import authService from "../../services/auth.service";
import { useNotification } from "../../context/NotificationContext";
import { Shield, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import "../../components/styles/Login.css"; // Reuse login styles (btn-login, form-input)
import "./styles/SecuritySettings.css"; // Import the new CSS file

const SecuritySettings = () => {
  const [step, setStep] = useState(1); // 1: Initial, 2: Scan QR, 3: Success
  const [qrUrl, setQrUrl] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  
  const user = authService.getCurrentUser();

  const handleEnableClick = async () => {
    setLoading(true);
    try {
      const response = await authService.enableMfa(user.username);
      if (response.data.status === "SUCCESS") {
        const url = response.data.data.qrCodeUrl; 
        setQrUrl(url);
        setStep(2);
      }
    } catch (error) {
      notify.error("Failed to initiate 2FA setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const payload = { username: user.username, otp: otp };
      const response = await authService.verifyMfaSetup(payload);
      
      if (response.data.status === "SUCCESS") {
        setStep(3);
        notify.success("Two-Factor Authentication Enabled!");
      }
    } catch (error) {
      notify.error("Invalid Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sys-container">
      {/* HEADER */}
      <div className="ss-header">
        <Shield size={28} color="#2563eb" />
        <h2 className="ss-title">Two-Factor Authentication</h2>
      </div>

      {/* STEP 1: INITIAL */}
      {step === 1 && (
        <div className="ss-content">
          <div className="ss-icon-circle">
            <Smartphone size={32} color="#2563eb" />
          </div>
          <h3 className="ss-step-title">Secure your account</h3>
          <p className="ss-description">
            Add an extra layer of security. Use Google Authenticator to generate verification codes.
          </p>
          <button 
            onClick={handleEnableClick}
            disabled={loading}
            className="btn-login ss-btn-center" 
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enable 2FA"}
          </button>
        </div>
      )}

      {/* STEP 2: SCAN QR */}
      {step === 2 && (
        <div className="ss-content">
          <p className="ss-instruction">1. Scan this QR Code with Google Authenticator</p>
          
          <div className="ss-qr-wrapper">
             <QRCodeCanvas value={qrUrl} size={200} />
          </div>

          <p className="ss-instruction mt">2. Enter the 6-digit code</p>
          
          <div className="input-wrapper ss-input-wrapper-center">
            <input
              type="text"
              className="form-input ss-otp-input"
              placeholder="000 000"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <button 
            onClick={handleVerify} 
            disabled={loading || otp.length < 6} 
            className="btn-login"
          >
             {loading ? <Loader2 className="animate-spin" /> : "Verify & Activate"}
          </button>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="ss-success-container">
          <CheckCircle size={60} color="#22c55e" className="ss-success-icon" />
          <h3 className="ss-success-title">You're all set!</h3>
          <p className="ss-description">
            Your account is now secured with Google Authenticator. You will be asked for a code next time you log in.
          </p>
          <button onClick={() => setStep(1)} className="ss-back-btn">
            Back to Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;