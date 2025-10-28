import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export const getPlans = () => api.get('/plans').then(res => res.data);
export const assignPlan = (userId, planId) => api.put(`/users/${userId}/plan/${planId}`).then(res => res.data);
export const getUserCurrentPlan = (userId) => api.get(`/users/${userId}/current-plan`).then(res => res.data);
export const getUserPlan = () => api.get('/user/plan').then(res => res.data);

export default api;
