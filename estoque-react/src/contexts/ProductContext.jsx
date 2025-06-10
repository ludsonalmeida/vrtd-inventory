import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch inicial, somente se autenticado
  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  }

  // create
  async function addProduct(product) {
    setLoading(true);
    try {
      const { data: newProduct } = await api.post('/products', product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // update
  async function updateProduct(id, updates) {
    setLoading(true);
    try {
      const { data: updated } = await api.put(`/products/${id}`, updates);
      setProducts(prev =>
        prev.map(p => (p._id === id ? updated : p))
      );
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // delete
  async function removeProduct(id) {
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return; // aguarda autenticação
    if (!user) return;       // não busca se não autenticado
    fetchProducts();
  }, [authLoading, user]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        removeProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider');
  }
  return context;
}
