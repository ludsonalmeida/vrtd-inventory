import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
// Configuração central do Axios
const api = axios.create({
   baseURL: `${BASE}/api`,   // <— adiciona o "/api" aqui uma vez só
  timeout: 60000,
});

// Interceptor de requisição para anexar token, se existir
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de resposta para tratar erros globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
