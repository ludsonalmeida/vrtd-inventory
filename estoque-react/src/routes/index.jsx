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


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;

  return (
    <Router>
      <Routes>
        {/* Rota pública: Home + Footer */}
        <Route path="/" element={<><HomePage /><Footer /></>} />

        {/* Rota pública: Login + Footer */}
        <Route path="/login" element={<><LoginPage /><Footer /></>} />

        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <NavBarRestrita />
                <Routes>
                  {/* Admin-only: registrar usuários */}
                  <Route
                    path="register"
                    element={
                      user?.role === 'admin'
                        ? <RegisterPage />
                        : <Navigate to="/dashboard" replace />
                    }
                  />

                  {/* Páginas principais */}
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductPage />} />
                  <Route path="estoque" element={<StockPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
                  <Route path="suppliers/report" element={<SuppliersReportPage />} />
                  <Route path="units" element={<UnitsPage />} />
                  <Route path="api/docs" element={<ApiDocs />} />
                  <Route path="/estoque/movements" element={<StockMovements />} />
                  {/* CRUD de Reservas */}
                  <Route path="reservations" element={<ReservationsPage />} />
                  <Route path="/cmv" element={<CMVDashboard />} />

                  {/* Seção de usuários */}
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/edit/:id" element={<EditUserPage />} />

                  {/* Wildcard: redireciona ao dashboard */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
                <FooterRestrito />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
