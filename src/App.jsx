import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoLoginBar from './components/DemoLoginBar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import EquipmentCatalogPage from './pages/EquipmentCatalogPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="d-flex flex-column min-vh-100">
            {/* Quick Demo Login Bar for 1-Click Tester Convenience */}
            <DemoLoginBar />

            {/* Main Application Navbar */}
            <Navbar />

            {/* Dynamic Routed Main View */}
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<EquipmentCatalogPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Dashboard */}
                <Route
                  path="/dashboard/customer"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Dashboard */}
                <Route
                  path="/dashboard/owner"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'admin']}>
                      <OwnerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Console */}
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Marketplace Footer */}
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
