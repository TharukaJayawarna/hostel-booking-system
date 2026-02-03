import api from "../api/axiosConfig";

// Get all users
const getAllUsers = () => {
  return api.get("/users");
};

// Create a new user
const createUser = (userData) => {
  return api.post("/users/create", userData);
};

// Delete a user by ID
const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};

const resetTwoFactorAuth = (username) => {
  return api.put(`/users/${username}/reset-2fa`);
};

const toggleUserTwoFactor = (username, enabled) => {
  return api.put(`/users/${username}/toggle-2fa?enabled=${enabled}`);
};

export default {
  getAllUsers,
  createUser,
  deleteUser,
  resetTwoFactorAuth,
  toggleUserTwoFactor,
};
