// src/contexts/UnitContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const UnitContext = createContext();

export function UnitProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Buscar unidades quando auth estiver pronto e user logado
  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    async function fetchUnits() {
      setLoading(true);
      try {
        const response = await api.get('/units');
        setUnits(response.data);
      } catch (err) {
        console.error('Erro ao buscar unidades:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, [authLoading, user]);

  // 2) Criar unidade
  async function addUnit(unitData) {
    if (!user) return;
    try {
      const response = await api.post('/units', unitData);
      setUnits(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Erro ao adicionar unidade:', err);
      throw err;
    }
  }

  // 3) Atualizar unidade
  async function updateUnit(id, updatedFields) {
    if (!user) return;
    try {
      const response = await api.put(`/units/${id}`, updatedFields);
      setUnits(prev => prev.map(u => (u._id === id ? response.data : u)));
    } catch (err) {
      console.error('Erro ao atualizar unidade:', err);
      throw err;
    }
  }

  // 4) Remover unidade
  async function removeUnit(id) {
    if (!user) return;
    try {
      await api.delete(`/units/${id}`);
      setUnits(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error('Erro ao remover unidade:', err);
      throw err;
    }
  }

  return (
    <UnitContext.Provider value={{ units, loading, addUnit, updateUnit, removeUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit deve ser usado dentro de um UnitProvider');
  }
  return context;
}
