import api from '../api/axiosConfig';

// Get all users
const getAllUsers = () => {
    return api.get('/users');
};

// Create a new user
const createUser = (userData) => {
    return api.post('/users/create', userData);
};

// Delete a user by ID
const deleteUser = (userId) => {
    return api.delete(`/users/${userId}`);
};

export default {
    getAllUsers,
    createUser,
    deleteUser
};