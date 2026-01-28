import api from '../api/axiosConfig';

// Get all beds
const getAllBeds = () => {
    return api.get('/beds');
};

// Create a new bed in a specific room
const createBed = (roomId, bedData) => {
    return api.post(`/rooms/${roomId}/beds`, bedData);
};

// Delete a bed
const deleteBed = (bedId) => {
    return api.delete(`/beds/${bedId}`);
};

// Toggle maintenance status
const toggleMaintenance = (bedId, status) => {
    return api.patch(`/beds/${bedId}/maintenance?status=${status}`);
};

export default {
    getAllBeds,
    createBed,
    deleteBed,
    toggleMaintenance
};