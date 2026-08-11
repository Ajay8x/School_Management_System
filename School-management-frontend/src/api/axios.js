import axios from 'axios';

const API = axios.create({
  baseURL: 'https://school-management-system-jgvl.vercel.app/api',
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
    config.headers['X-School-ID'] = schoolId;
  }
  return config;
});

export default API;
