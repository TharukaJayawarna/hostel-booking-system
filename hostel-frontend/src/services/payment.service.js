import api from '../api/axiosConfig';

// Verify payment with PayHere order ID
const verifyPayment = (orderId) => {
    return api.post(
        `/payments/verify/${orderId}`, 
        {},
        { headers: { 'X-Api-Version': 'v1' } }
    );
};

export default {
    verifyPayment
};