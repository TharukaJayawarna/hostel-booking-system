import api from "../api/axiosConfig";

// Login Step 1: Send Username & Password
const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

// Login Step 2: Verify OTP (Email or Google Auth)
const verifyLogin = (data) => {
  return api.post("/auth/verify-login", data);
};

const register = (userData) => {
  return api.post("/auth/register", userData);
};

// --- NEW: MFA Setup Endpoints ---

// 1. Request to Enable MFA (Get QR Code)
const enableMfa = (username) => {
  return api.post(`/auth/mfa/enable?username=${username}`);
};

// 2. Verify and Activate MFA
const verifyMfaSetup = (data) => {
  return api.post("/auth/mfa/verify", data);
};

// --------------------------------

const getCurrentUser = () => {
  const localUser = localStorage.getItem("user");
  if (localUser) {
    return JSON.parse(localUser);
  }
  const sessionUser = sessionStorage.getItem("user");
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  return null;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.href = "/login";
};

const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};
const resendOtp = (username) => {
  return api.post(`/auth/resend-otp?username=${username}`);
};

export default {
  login,
  verifyLogin,
  enableMfa,      // Exported
  verifyMfaSetup, // Exported
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  resendOtp,
};