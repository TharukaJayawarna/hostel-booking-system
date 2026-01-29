import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import "../../components/styles/Login.css";

import authService from "../../services/auth.service";

const Login = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim() || !formData.password) {
      setError("Username and Password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);

      if (response.data.status === "SUCCESS") {
        const user = response.data.data;

        localStorage.setItem("user", JSON.stringify(user));

        sessionStorage.removeItem("user");

        notify.success(`Welcome back, ${user.firstName}!`);

        if (user.role === "ADMIN" || user.role === "WARDEN") {
          navigate("/admin/dashboard");
        } else {
          navigate(from === "/login" ? "/" : from, { replace: true });
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <div className="login-overlay"></div>
        <div className="login-image-content">
          <div className="login-brand-logo">H</div>
          <h1 className="brand-title">Welcome to Hostel PMS</h1>
          <p className="brand-desc">
            Your all-in-one solution for seamless hostel management. Secure
            bookings, easy payments, and smart facility management.
          </p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <div className={`input-wrapper ${error ? "error-border" : ""}`}>
                <div className="input-icon">
                  <User size={20} />
                </div>
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
                <div className="input-icon">
                  <Lock size={20} />
                </div>
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

            <div
              className="form-actions"
              style={{ justifyContent: "flex-end" }}
            >
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign in <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="login-footer">
              Don't have an account?
              <Link to="/signup" className="register-link">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
