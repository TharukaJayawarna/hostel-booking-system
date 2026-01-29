import api from "../api/axiosConfig";

const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

const register = (userData) => {
  return api.post("/auth/register", userData);
};

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

export default {
  login,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
