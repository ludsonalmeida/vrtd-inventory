// src/routes/index.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBarRestrita from '../components/NavBarRestrita';
import FooterRestrito from '../components/FooterRestrito';
import Footer from '../components/Footer';
import ApiDocs from '../pages/ApiDocs';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import StockPage from '../pages/StockPage.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import SuppliersPage from '../pages/SuppliersPage.jsx';
import SuppliersReportPage from '../pages/SuppliersReportPage.jsx';
import UnitsPage from '../pages/UnitsPage.jsx';
import ProductPage from '../pages/ProductPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import EditUserPage from '../pages/EditUserPage.jsx';
import ReservationsPage from '../pages/ReservationsPage';
import CMVDashboard from '../pages/CMVDashboard';
import StockMovements from '../pages/StockMovements';
import CardapioPage from '../pages/CardapioPage';
import SignUpCard from '../pages/signUpCard.jsx';
import RedirectPage from '../pages/RedirectPage';
import PixelLoader from '../components/PixelLoader';
import ChopesPage from '../pages/ChopesPage';
import LGPD from '../pages/lgpd.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div>Carregando...</div>;

  return (
    <Router>
      {/* PixelLoader is mounted once and visible on every route */}
      <PixelLoader />
      <Routes>
        {/* Página inicial pública */}
        <Route path="/" element={<><HomePage /><Footer /></>} />
        {/* Página de Cardápio pública, sem layout extra */}
        <Route path="/cardapio" element={<CardapioPage />} />
        <Route path="/clubedochope" element={<SignUpCard />} />
        <Route path="/politicas-de-privacidade" element={<LGPD />} />
        
        {/* Página de Chopes pública */}
        <Route path="/chopes" element={<ChopesPage />} />
        {/* Nova rota de redirecionamento para o grupo WhatsApp */}
        <Route path="/redirect-wpp" element={<RedirectPage />} />
        {/* Login e registro permanecem com Footer */}
        <Route path="/login" element={<><LoginPage /><Footer /></>} />
        <Route path="/register" element={<><RegisterPage /><Footer /></>} />

        {/* Rotas protegidas individualmente */}
        <Route path="/dashboard" element={<ProtectedRoute><NavBarRestrita /><DashboardPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/estoque" element={<ProtectedRoute><NavBarRestrita /><StockPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><NavBarRestrita /><ProductPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><NavBarRestrita /><CategoriesPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><NavBarRestrita /><SuppliersPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/suppliers/report" element={<ProtectedRoute><NavBarRestrita /><SuppliersReportPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/units" element={<ProtectedRoute><NavBarRestrita /><UnitsPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/api/docs" element={<ProtectedRoute><NavBarRestrita /><ApiDocs /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/estoque/movements" element={<ProtectedRoute><NavBarRestrita /><StockMovements /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><NavBarRestrita /><ReservationsPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/cmv" element={<ProtectedRoute><NavBarRestrita /><CMVDashboard /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><NavBarRestrita /><UsersPage /><FooterRestrito /></ProtectedRoute>} />
        <Route path="/users/edit/:id" element={<ProtectedRoute><NavBarRestrita /><EditUserPage /><FooterRestrito /></ProtectedRoute>} />

        {/* Rota coringa pública */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
