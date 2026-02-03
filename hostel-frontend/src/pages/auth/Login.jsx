import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { 
  User, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone,
  RefreshCw // Added Icon
} from "lucide-react";
import "../../components/styles/Login.css";
import authService from "../../services/auth.service";

const Login = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Login Steps: 'CREDENTIALS', 'EMAIL_OTP', 'GOOGLE_OTP'
  const [loginStep, setLoginStep] = useState("CREDENTIALS");
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // --- NEW: Resend OTP State ---
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  // -----------------------------

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    setError("");
  };

  // --- NEW: Timer Logic ---
  useEffect(() => {
    let interval;
    // Only run timer if we are in EMAIL_OTP step and timer > 0
    if (loginStep === "EMAIL_OTP" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [loginStep, timer]);

  // --- NEW: Handle Resend Click ---
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await authService.resendOtp(formData.username);
      notify.success("New OTP sent to your email.");
      setTimer(60); // Reset timer
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP.";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Username/Password
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password) {
      setError("Username and Password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);

      if (response.data.status === "SUCCESS") {
        const data = response.data.data;
        const signal = data.firstName;

        if (signal === "GOOGLE_AUTH_REQUIRED") {
          setLoginStep("GOOGLE_OTP");
          notify.info("Enter code from Google Authenticator app.");
        } else if (signal === "EMAIL_2FA_REQUIRED" || signal === "2FA_REQUIRED") {
          setLoginStep("EMAIL_OTP");
          setTimer(60); // Reset timer on new login attempt
          setCanResend(false);
          notify.info("OTP sent to your email. Please verify.");
        } else {
          handleSuccess(data);
        }
        setError("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const verifyPayload = {
        username: formData.username,
        otp: otp
      };

      const response = await authService.verifyLogin(verifyPayload);

      if (response.data.status === "SUCCESS") {
        const user = response.data.data;
        handleSuccess(user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid Code.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.removeItem("user");
    localStorage.setItem("token", user.token);

    notify.success(`Welcome back, ${user.firstName}!`);

    if (user.role === "ADMIN" || user.role === "WARDEN") {
      navigate("/admin/dashboard");
    } else {
      navigate(from === "/login" ? "/" : from, { replace: true });
    }
  };

  const getStepTitle = () => {
    switch (loginStep) {
      case "GOOGLE_OTP": return "Google Authenticator";
      case "EMAIL_OTP": return "Email Verification";
      default: return "Sign In";
    }
  };

  const getStepDesc = () => {
    switch (loginStep) {
      case "GOOGLE_OTP": return "Enter the 6-digit code from your app.";
      case "EMAIL_OTP": return "Enter the code sent to your email.";
      default: return "Welcome back! Please enter your details.";
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <div className="login-overlay"></div>
        <div className="login-image-content">
          <div className="login-brand-logo">H</div>
          <h1 className="brand-title">Welcome to Hostel PMS</h1>
          <p className="brand-desc">Secure. Efficient. Reliable.</p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2 className="login-title">{getStepTitle()}</h2>
            <p className="login-subtitle">{getStepDesc()}</p>
          </div>

          {loginStep === "CREDENTIALS" ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className={`input-wrapper ${error ? "error-border" : ""}`}>
                  <div className="input-icon"><User size={20} /></div>
                  <input
                    name="username"
                    className="form-input"
                    placeholder="Enter your username"
                    onChange={handleChange}
                    value={formData.username}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className={`input-wrapper ${error ? "error-border" : ""}`}>
                  <div className="input-icon"><Lock size={20} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formData.password}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-actions" style={{ justifyContent: "flex-end" }}>
                <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
              </div>

              {error && <div className="login-error-msg">{error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign in <ArrowRight size={20} /></>}
              </button>
            </form>
          ) : (
            /* --- OTP FORM --- */
            <form onSubmit={handleOtpSubmit}>
              <div className="input-group">
                <label className="input-label">Verification Code</label>
                <div className={`input-wrapper ${error ? "error-border" : ""}`}>
                  <div className="input-icon">
                    {loginStep === "GOOGLE_OTP" ? <Smartphone size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <input
                    type="text"
                    name="otp"
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    onChange={handleOtpChange}
                    value={otp}
                    autoFocus
                  />
                </div>
              </div>

              {/* --- RESEND OTP SECTION (Only for Email) --- */}
              {loginStep === "EMAIL_OTP" && (
                <div className="resend-container">
                  {canResend ? (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      <RefreshCw size={14} /> Resend OTP
                    </button>
                  ) : (
                    <span className="resend-timer">
                      Resend code in <span>{timer}s</span>
                    </span>
                  )}
                </div>
              )}

              <div className="form-actions" style={{ justifyContent: "center", marginBottom: "10px" }}>
                 <span style={{ fontSize: "0.9rem", color: "#666" }}>
                   Try another way? <button type="button" onClick={() => setLoginStep("CREDENTIALS")} style={{ border: "none", background: "none", color: "#1e40af", cursor: "pointer", textDecoration: "underline" }}>Back to Login</button>
                 </span>
              </div>

              {error && <div className="login-error-msg">{error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Login <ArrowRight size={20} /></>}
              </button>
            </form>
          )}

          {loginStep === "CREDENTIALS" && (
            <div className="login-footer">
              Don't have an account? <Link to="/signup" className="register-link">Create account</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;