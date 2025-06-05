// src/contexts/SupplierContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api'; // instância axios configurada para apontar a sua API
import { useAuth } from './AuthContext';

const SupplierContext = createContext();

export function SupplierProvider({ children }) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Carregar lista de fornecedores quando user estiver autenticado
  useEffect(() => {
    if (!user) {
      setSuppliers([]);
      setLoading(false);
      return;
    }

    async function fetchSuppliers() {
      setLoading(true);
      try {
        const response = await api.get('/suppliers');
        setSuppliers(response.data);
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSuppliers();
  }, [user]);

  // 2) Criar um fornecedor
  async function addSupplier(data) {
    if (!user) return;
    try {
      const response = await api.post('/suppliers', data);
      setSuppliers(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Erro ao adicionar fornecedor:', err);
      throw err;
    }
  }

  // 3) Atualizar um fornecedor
  async function updateSupplier(id, updates) {
    if (!user) return;
    try {
      const response = await api.put(`/suppliers/${id}`, updates);
      setSuppliers(prev =>
        prev.map(sup => (sup._id === id ? response.data : sup))
      );
    } catch (err) {
      console.error('Erro ao atualizar fornecedor:', err);
      throw err;
    }
  }

  // 4) Remover um fornecedor
  async function removeSupplier(id) {
    if (!user) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setSuppliers(prev => prev.filter(sup => sup._id !== id));
    } catch (err) {
      console.error('Erro ao remover fornecedor:', err);
      throw err;
    }
  }

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        addSupplier,
        updateSupplier,
        removeSupplier,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (!context) throw new Error('useSupplier deve ser usado dentro de SupplierProvider');
  return context;
}
