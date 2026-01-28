import api from "../api/axiosConfig";

// Login user
const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

// Register user (Student)
const register = (userData) => {
  return api.post("/auth/register", userData);
};

// User ඉන්නවද කියලා බලන Function එක
const getCurrentUser = () => {
  // 1. මුලින්ම Local Storage එකේ බලන්න (Remember Me දාපු අය)
  const localUser = localStorage.getItem("user");
  if (localUser) {
    return JSON.parse(localUser);
  }

  // 2. Local Storage එකේ නැත්නම්, Session Storage එකේ බලන්න (Remember Me නොදාපු අය)
  const sessionUser = sessionStorage.getItem("user");
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }

  // 3. දෙකේම නැත්නම් User කෙනෙක් නෑ
  return null;
};

// Logout user
const logout = () => {
  // 1. Local Storage Clear කිරීම
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // 2. Session Storage Clear කිරීම (Remember Me නැති අය සඳහා)
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  // 3. Redirect to Login
  window.location.href = "/login";
};
// Forgot Password
const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

// Reset Password
const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
