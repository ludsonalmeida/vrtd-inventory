// src/contexts/StockMovementsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const StockMovementsContext = createContext();

export function StockMovementsProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Torna fetchMovements estável com useCallback
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock/movements');
      setMovements(res.data);
    } catch (err) {
      console.error('Erro ao buscar movimentos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2) Busca movimentos após autenticar
  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    fetchMovements();
  }, [authLoading, user, fetchMovements]);

  // 3) Cria novo movimento
  const addMovement = async ({ product, quantity, type, reason }) => {
    if (!user) return;
    try {
      const res = await api.post('/stock/movements', {
        product,
        quantity,
        type,
        reason,
      });
      setMovements(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Erro ao criar movimento:', err);
      throw err;
    }
  };

  return (
    <StockMovementsContext.Provider
      value={{ movements, loading, addMovement, fetchMovements }}
    >
      {children}
    </StockMovementsContext.Provider>
  );
}

export function useStockMovements() {
  const context = useContext(StockMovementsContext);
  if (!context) {
    throw new Error('useStockMovements deve ser usado dentro de um StockMovementsProvider');
  }
  return context;
}
