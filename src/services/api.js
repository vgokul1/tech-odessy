import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Automatically inject JWT token into authorization header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentalhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('rentalhub_token')) {
        localStorage.removeItem('rentalhub_token');
        localStorage.removeItem('rentalhub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
