import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://school-management-system-jgvl.vercel.app/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Add a request interceptor to attach the JWT token AND active school ID to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Inject the currently active school ID so backend can scope data
  const schoolId = localStorage.getItem('active_school_id');
  if (schoolId) {
    config.headers['x-school-id'] = schoolId;
  }
  
  // Inject the currently active session ID so backend can scope data by academic year
  const activeSessionStr = localStorage.getItem('active_session');
  if (activeSessionStr) {
    try {
      const activeSession = JSON.parse(activeSessionStr);
      if (activeSession && activeSession._id) {
        config.headers['x-session-id'] = activeSession._id;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  return config;
});

export default API;
