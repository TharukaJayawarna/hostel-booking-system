import api from "../api/axiosConfig";

const getActiveAnnouncements = () => {
  return api.get("/announcements/active");
};

const getAllAnnouncements = () => {
  return api.get("/announcements/all");
};

const createAnnouncement = (data) => {
  return api.post("/announcements", data);
};

const deleteAnnouncement = (id) => {
  return api.delete(`/announcements/${id}`);
};

export default {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};