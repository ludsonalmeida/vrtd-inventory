// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor para anexar token, se houver
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // onde vamos armazenar
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
