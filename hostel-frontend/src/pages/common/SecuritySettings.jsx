import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // npm install qrcode.react
import authService from "../../services/auth.service";
import { useNotification } from "../../context/NotificationContext";
import { Shield, Smartphone, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import "../../components/styles/Login.css"; // Reuse login styles or create new

const SecuritySettings = () => {
  const [step, setStep] = useState(1); // 1: Initial, 2: Scan QR, 3: Success
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  
  const user = authService.getCurrentUser();

  const handleEnableClick = async () => {
    setLoading(true);
    try {
      const response = await authService.enableMfa(user.username);
      if (response.data.status === "SUCCESS") {
        // Backend should return "otpauth://..." URL in data.qrCodeUrl
        // If backend sends Google Chart URL, we can use it directly as image src
        // But assumed backend sends the otpauth string or a valid URL.
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
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <Shield size={28} color="#2563eb" />
        <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#1e293b" }}>Two-Factor Authentication</h2>
      </div>

      {step === 1 && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ background: "#eff6ff", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Smartphone size={32} color="#2563eb" />
          </div>
          <h3 style={{ marginBottom: "10px" }}>Secure your account</h3>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>
            Add an extra layer of security. Use Google Authenticator to generate verification codes.
          </p>
          <button 
            onClick={handleEnableClick}
            disabled={loading}
            className="btn-login" 
            style={{ maxWidth: "200px", margin: "0 auto" }}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enable 2FA"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "600", marginBottom: "20px" }}>1. Scan this QR Code with Google Authenticator</p>
          
          <div style={{ background: "#fff", padding: "15px", display: "inline-block", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
             {/* If qrUrl is otpauth:// string, use QRCodeCanvas */}
             <QRCodeCanvas value={qrUrl} size={200} />
          </div>

          <p style={{ fontWeight: "600", marginTop: "25px", marginBottom: "10px" }}>2. Enter the 6-digit code</p>
          
          <div className="input-wrapper" style={{ maxWidth: "200px", margin: "0 auto 20px" }}>
            <input
              type="text"
              className="form-input"
              style={{ textAlign: "center", letterSpacing: "5px", fontSize: "1.2rem" }}
              placeholder="000 000"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <button onClick={handleVerify} disabled={loading || otp.length < 6} className="btn-login">
             {loading ? <Loader2 className="animate-spin" /> : "Verify & Activate"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <CheckCircle size={60} color="#22c55e" style={{ margin: "0 auto 20px" }} />
          <h3 style={{ color: "#15803d" }}>You're all set!</h3>
          <p style={{ color: "#64748b" }}>
            Your account is now secured with Google Authenticator. You will be asked for a code next time you log in.
          </p>
          <button onClick={() => setStep(1)} style={{ marginTop: "20px", background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}>
            Back to Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;