import api from "../api/axiosConfig";

// Get notifications for the logged-in student
const getMyNotifications = () => {
  return api.get("/notifications/my");
};

// Mark a specific notification as read
const markAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

// Clear all notifications
const clearAllNotifications = () => {
  return api.delete("/notifications/clear");
};

export default {
  getMyNotifications,
  markAsRead,
  clearAllNotifications,
};
