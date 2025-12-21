import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://hellocare.p1ng.me/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Mock data for demo mode
export const mockData = {
    stats: {
        doctors: 12,
        patients: 450,
        appointments: 89,
        revenue: 25000
    },
    recentActivity: [
        { id: 1, type: 'appointment', message: 'New appointment booked', time: '2 mins ago' },
        { id: 2, type: 'user', message: 'New doctor registered', time: '1 hour ago' },
        { id: 3, type: 'review', message: 'New 5-star review received', time: '3 hours ago' }
    ]
};

export default api;
