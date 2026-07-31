import axios from 'axios';

const API = axios.create({
  baseURL: 'https://school-management-system-75o0.onrender.com/api', // Pointing to the backend we just built
});

// Add a request interceptor to attach the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
