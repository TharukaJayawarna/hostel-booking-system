import api from '../api/axiosConfig';

// --- Admin APIs ---
const getAllReservations = () => api.get('/reservations');
const getTrashReservations = () => api.get('/reservations/trash');
const getReservationById = (id) => api.get(`/reservations/${id}`);
const createManualReservation = (data) => api.post('/reservations/admin/create', data);
const cancelReservation = (id) => api.patch(`/reservations/${id}/cancel`);
const reactivateReservation = (id) => api.post(`/reservations/${id}/reactivate`);
const getMatchingBeds = (id) => api.get(`/reservations/${id}/matching-beds`);
const assignBed = (id, bedId) => api.post(`/reservations/${id}/assign/${bedId}`);

// --- Student APIs ---
const getMyBookings = () => api.get('/reservations/student/my-bookings');
const changeBookingDates = (id, newDates) => api.patch(`/reservations/${id}/change-dates`, newDates);

// --- New Functions for Reservation Page ---

// Calculate reservation price
const calculatePrice = (params) => {
    return api.get(`/reservations/calculate`, {
        params,
        headers: { 'X-Api-Version': 'v1' }
    });
};

// Initiate reservation (Start Payment)
const initiateReservation = (data) => {
    return api.post('/reservations/initiate', data, {
        headers: { 'X-Api-Version': 'v1' }
    });
};

export default {
    getAllReservations,
    getTrashReservations,
    getReservationById,
    createManualReservation,
    cancelReservation,
    reactivateReservation,
    getMatchingBeds,
    assignBed,
    getMyBookings,
    changeBookingDates,
    calculatePrice,
    initiateReservation
};