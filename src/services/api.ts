import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
    console.warn('VITE_API_URL is not set in production. Falling back to localhost:3000');
}

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the authToken to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle specialized errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Potential redirect to login if we were using a router like React Router
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
