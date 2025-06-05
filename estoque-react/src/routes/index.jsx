// src/routes/index.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import StockPage from '../pages/StockPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import SuppliersPage from '../pages/SuppliersPage.jsx';    // ⬅️ importar a nova página
import UnitsPage from '../pages/UnitsPage.jsx';            // ⬅️ caso já exista

import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Rota pública: Home */}
        <Route path="/" element={<HomePage />} />

        {/* Rota pública: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota de registro: apenas admin autenticado */}
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
            </ProtectedRoute>
          }
        />

        {/* Dashboard: qualquer usuário autenticado */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Estoque: qualquer usuário autenticado */}
        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          }
        />

        {/* Categorias: qualquer usuário autenticado */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        {/* Unidades de medida: qualquer usuário autenticado */}
        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <UnitsPage />
            </ProtectedRoute>
          }
        />

        {/* Fornecedores: qualquer usuário autenticado */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />

        {/* Qualquer outra rota redireciona para Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
