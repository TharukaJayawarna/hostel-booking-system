import api from "../api/axiosConfig";

// Get all floors
const getAllFloors = () => {
  return api.get("/floors");
};

// Create a new floor under a specific hub
const createFloor = (hubId, floorData) => {
  return api.post(`/hubs/${hubId}/floors`, floorData);
};

// Delete a floor
const deleteFloor = (floorId) => {
  return api.delete(`/floors/${floorId}`);
};

const getRoomsByFloor = (floorId) => {
  return api.get(`/floors/${floorId}/rooms`);
};

export default {
  getAllFloors,
  createFloor,
  deleteFloor,
  getRoomsByFloor,
};
