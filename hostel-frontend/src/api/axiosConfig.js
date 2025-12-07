import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Backend URL
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Version': 'v1' // අපි Backend එකේ දාපු Header එක
    }
});

export default api;