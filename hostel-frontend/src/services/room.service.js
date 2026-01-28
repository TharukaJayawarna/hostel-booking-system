import api from '../api/axiosConfig';

const getAllRooms = () => api.get('/rooms');
const createRoom = (floorId, roomData) => api.post(`/floors/${floorId}/rooms`, roomData);
const updateRoom = (roomId, roomData) => api.put(`/rooms/${roomId}`, roomData);
const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`);
const getBedsByRoom = (roomId) => api.get(`/rooms/${roomId}/beds`);

// New Function: Check room availability
const checkAvailability = (hubId, checkIn, checkOut) => {
    return api.get(`/rooms/available`, {
        params: { hubId, checkIn, checkOut }
    });
};

export default {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getBedsByRoom,
    checkAvailability
};