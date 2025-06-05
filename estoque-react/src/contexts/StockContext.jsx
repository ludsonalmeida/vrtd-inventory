// src/contexts/StockContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const StockContext = createContext();

export function StockProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Só buscar estoque depois que a autenticação estiver pronta
  useEffect(() => {
    // Se ainda estou carregando auth, ou se não há usuário logado, não busco
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    // Agora que authLoading é false e user existe, busco estoque
      async function fetchStock() {
    setLoading(true);
    try {
      const response = await api.get('/stock');
      setStock(response.data);
    } catch (err) {
      // Exiba status, data e mensagem
      console.error('Erro ao buscar estoque:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }

  fetchStock();
}, [authLoading, user]);

  // 2) Criar um item (POST /stock) – disponível apenas se user existir
  async function addItem(itemData) {
    if (!user) return;
    try {
      const response = await api.post('/stock', itemData);
      setStock(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
    }
  }

  // 3) Atualizar um item (PUT /stock/:id)
  async function updateItem(id, updatedFields) {
    if (!user) return;
    try {
      const response = await api.put(`/stock/${id}`, updatedFields);
      setStock(prev =>
        prev.map(item => (item._id === id ? response.data : item))
      );
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
    }
  }

  // 4) Remover um item (DELETE /stock/:id)
  async function removeItem(id) {
    if (!user) return;
    try {
      await api.delete(`/stock/${id}`);
      setStock(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  }

  return (
    <StockContext.Provider
      value={{ stock, loading, addItem, updateItem, removeItem }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock deve ser usado dentro de um StockProvider');
  }
  return context;
}
