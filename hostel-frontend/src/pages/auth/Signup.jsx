import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Type,
  ArrowRight,
  Loader2,
  Wifi,
  ShieldCheck,
  Coffee,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import "../../components/styles/Signup.css";

// Service import
import authService from "../../services/auth.service";

const Signup = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    username: "",
    password: "",
    role: "STUDENT",
  });

  // --- Validation Logic ---
  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:0|94|\+94)?(?:7\d{8})$/; // Sri Lankan Mobile Format (07xxxxxxxx)

    if (!formData.firstName.trim()) tempErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) tempErrors.lastName = "Last name is required";
    
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!formData.contactNumber) {
      tempErrors.contactNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.contactNumber)) {
      tempErrors.contactNumber = "Invalid phone number (e.g., 0771234567)";
    }

    if (!formData.username.trim()) tempErrors.username = "Username is required";
    
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      notify.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      notify.success("Registration Successful! Please login.");
      navigate("/login");
    } catch (error) {
      notify.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* LEFT SIDE - Features Section */}
      <div className="signup-image-section">
        <div className="signup-overlay"></div>

        {/* Brand Top Left */}
        <div className="signup-brand-content">
          <div className="brand-logo-box">H</div>
          Hostel PMS
        </div>

        {/* Features List Bottom Left */}
        <div className="signup-features-content">
          <h2 className="features-title">
            More than just a place
            <br />
            to sleep.
          </h2>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-box"><Wifi size={20} /></div>
              <div className="feature-text">
                <span className="feature-item-title">High-Speed WiFi</span>
                <span className="feature-desc">Fiber internet access in all rooms and study areas.</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box"><ShieldCheck size={20} /></div>
              <div className="feature-text">
                <span className="feature-item-title">24/7 Security</span>
                <span className="feature-desc">Round-the-clock surveillance and support.</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box"><Coffee size={20} /></div>
              <div className="feature-text">
                <span className="feature-item-title">Modern Common Areas</span>
                <span className="feature-desc">Spacious lounges and study rooms.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Signup Form */}
      <div className="signup-form-section">
        <div className="signup-form-wrapper">
          <div className="signup-header">
            <h2 className="signup-title">Create an account</h2>
            <p className="signup-subtitle">
              Join the community today! Enter your details below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-row">
              <div className="input-group">
                <label className="input-label">First Name</label>
                <div className={`input-container ${errors.firstName ? 'error' : ''}`}>
                  <div className="input-icon"><Type size={18} /></div>
                  <input
                    name="firstName"
                    className="form-input"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Last Name</label>
                <div className={`input-container ${errors.lastName ? 'error' : ''}`}>
                  <div className="input-icon"><Type size={18} /></div>
                  <input
                    name="lastName"
                    className="form-input"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className={`input-container ${errors.email ? 'error' : ''}`}>
                <div className="input-icon"><Mail size={18} /></div>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="john.doe@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-grid-row">
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div className={`input-container ${errors.contactNumber ? 'error' : ''}`}>
                  <div className="input-icon"><Phone size={18} /></div>
                  <input
                    name="contactNumber"
                    className="form-input"
                    placeholder="0771234567"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <div className={`input-container ${errors.username ? 'error' : ''}`}>
                  <div className="input-icon"><User size={18} /></div>
                  <input
                    name="username"
                    className="form-input"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className={`input-container ${errors.password ? 'error' : ''}`}>
                <div className="input-icon"><Lock size={18} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password ? (
                <span className="error-text">{errors.password}</span>
              ) : (
                <p className="password-hint">Must be at least 8 characters long.</p>
              )}
            </div>

            <button type="submit" className="btn-signup" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>

            <div className="signup-footer">
              Already have an account? <Link to="/login" className="login-link">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;