import api from "../api/axiosConfig";

// Get all hubs
const getAllHubs = () => {
  return api.get("/hubs");
};

// Create a new hub
const createHub = (hubData) => {
  return api.post("/hubs", hubData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete a hub
const deleteHub = (hubId) => {
  return api.delete(`/hubs/${hubId}`);
};

const getFloorsByHub = (hubId) => {
  return api.get(`/hubs/${hubId}/floors`);
};

export default {
  getAllHubs,
  createHub,
  deleteHub,
  getFloorsByHub,
};
