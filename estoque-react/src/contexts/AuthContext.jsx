// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Função auxiliar para decodificar o payload do JWT sem usar jwt-decode
function decodeToken(token) {
  try {
    // O JWT tem 3 partes separadas por ponto: header.payload.signature
    const [, payloadBase64] = token.split('.');
    // O payload vem base64url (sem '=' e com '-' e '_' no lugar de '+' e '/')
    // Precisamos converter de base64url para base64 padrão:
    const base64 = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      // Ajustar o padding para múltiplo de 4:
      .padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, '=');

    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[AuthContext] decodeToken falhou:', err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao montar, verificar se há token válido no localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    //console.log('[AuthContext] Montagem: token do localStorage =', token);

    if (token) {
      const decoded = decodeToken(token);
      if (
        !decoded ||
        // Se payload não tiver exp (ou estiver expirado), removemos
        typeof decoded.exp !== 'number' ||
        decoded.exp * 1000 < Date.now()
      ) {
        console.log('[AuthContext] Token inválido ou expirado — removendo');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } else {
        console.log('[AuthContext] Token válido — setando header e user');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({
          email: decoded.email,
          role: decoded.role,
          userId: decoded.userId
        });
      }
    }

    setLoading(false);
  }, []);

  // Se ainda estivermos carregando, não renderiza nada (ou um spinner)
  if (loading) {
    return null; // ou <CircularProgress /> se quiser mostrar um loader
  }

  // Função de login
  async function signIn({ email, password }) {
    console.log('[AuthContext] signIn chamado com:', { email, password });
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('[AuthContext] Resposta do POST /auth/login:', response.data);

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decoded = decodeToken(token);
      if (!decoded) {
        throw new Error('Não foi possível decodificar o token');
      }
      console.log('[AuthContext] token decodificado:', decoded);

      setUser({
        email: userData.email,
        role: userData.role,
        userId: decoded.userId
      });
      console.log('[AuthContext] setUser finalizado, user =', {
        email: userData.email,
        role: userData.role,
        userId: decoded.userId
      });
    } catch (error) {
      console.log(
        '[AuthContext] Erro no signIn:',
        error.response?.data?.error || error
      );
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  }

  // Função de logout
  function signOut() {
    console.log('[AuthContext] signOut chamado');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
