// src/services/api.js
import axios from 'axios';

// Normaliza a BASE e garante que não duplique barras
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const BASE = String(rawBase).replace(/\/+$/, ''); // remove barra no final

const api = axios.create({
  baseURL: `${BASE}/api`,        // concentra o /api aqui
  timeout: 20000,                // 20s (melhor UX para retry)
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ===== Interceptor de requisição: token + request-id (opcional) =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Interceptor de resposta: 401 e mensagens amigáveis =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: dropa token e redireciona p/ login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return; // evita cair no Promise.reject
    }

    // Mensagens amigáveis para alguns cenários comuns:
    if (error.code === 'ECONNABORTED') {
      // timeout estourado
      error.userMessage =
        'A conexão está lenta e excedeu o tempo limite. Podemos tentar novamente em instantes.';
    } else if (!error.response) {
      // erro de rede / CORS / DNS / offline
      const offline = typeof navigator !== 'undefined' && navigator && navigator.onLine === false;
      error.userMessage = offline
        ? 'Você está sem conexão agora. Verifique sua internet e tente novamente.'
        : 'Não foi possível comunicar com o servidor. Tente novamente em alguns segundos.';
    } else if (error.response?.status >= 500) {
      error.userMessage =
        'Estamos com instabilidade no servidor agora. Tente novamente já já.';
    }

    return Promise.reject(error);
  }
);

// ===== Utilitário de retry com backoff exponencial =====
// use: await api.requestWithRetry({ method:'post', url:'/reservations', data }, { tries:3 });
function shouldRetry(err) {
  // timeout, erro de rede (sem response), ou 5xx merecem retry
  if (err?.code === 'ECONNABORTED') return true;
  if (!err?.response) return true;
  const s = err.response.status;
  if (s >= 500 && s < 600) return true;
  return false;
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

api.requestWithRetry = async function requestWithRetry(config, { tries = 3, baseBackoff = 800 } = {}) {
  let lastErr = null;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await api.request(config);
    } catch (err) {
      lastErr = err;
      if (!shouldRetry(err) || attempt === tries) {
        throw err;
      }
      // backoff exponencial simples: 0ms, 800ms, 1600ms...
      const wait = (attempt - 1) * baseBackoff;
      await delay(wait);
    }
  }
  throw lastErr;
};

// Conveniências
api.postRetry = (url, data, options, retry = { tries: 3, baseBackoff: 800 }) =>
  api.requestWithRetry({ method: 'post', url, data, ...(options || {}) }, retry);

api.getRetry = (url, options, retry = { tries: 3, baseBackoff: 800 }) =>
  api.requestWithRetry({ method: 'get', url, ...(options || {}) }, retry);

export default api;
