import api from "../api/axiosConfig";

// Get maximum allowed booking days
const getMaxBookingDays = () => {
  return api.get("/settings/max-days");
};

// Update maximum booking days
const updateMaxBookingDays = (days) => {
  return api.post("/settings/update", { MAX_BOOKING_DAYS: days });
};

// Get all blocked date ranges
const getBlockedDates = () => {
  return api.get("/settings/blocked-dates");
};

// Add a new blocked date range
const addBlockedDate = (data) => {
  return api.post("/settings/blocked-dates", data);
};

// Delete a blocked date range
const deleteBlockedDate = (id) => {
  return api.delete(`/settings/blocked-dates/${id}`);
};

export default {
  getMaxBookingDays,
  updateMaxBookingDays,
  getBlockedDates,
  addBlockedDate,
  deleteBlockedDate,
};
