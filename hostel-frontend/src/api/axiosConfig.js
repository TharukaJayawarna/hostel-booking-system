import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', 
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Version': 'v1' 
    }
});

// Request Interceptor එක
api.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor (Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Token එක වැඩ නැත්නම් Login එකට යවන්න (Optional)
      console.error("Access Denied: Invalid Token");
    }
    return Promise.reject(error);
  }
);

export default api;