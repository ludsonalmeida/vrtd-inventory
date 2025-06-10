// src/contexts/CategoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [authLoading, user]);

  async function addCategory(data) {
    if (!user) return;
    try {
      const response = await api.post('/categories', data);
      setCategories(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      throw err;
    }
  }

  async function updateCategory(id, updatedFields) {
    if (!user) return;
    try {
      const response = await api.put(`/categories/${id}`, updatedFields);
      setCategories(prev =>
        prev.map(cat => (cat._id === id ? response.data : cat))
      );
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      throw err;
    }
  }

  async function removeCategory(id) {
    if (!user) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      throw err;
    }
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        removeCategory
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory deve ser usado dentro de um CategoryProvider');
  }
  return context;
}
