import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CompareProvider } from './context/CompareContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CompareDrawer from './components/CompareDrawer';

// Pages
import Home from './pages/Home';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import ComparePage from './pages/ComparePage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import EquipmentForm from './pages/owner/EquipmentForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CompareProvider>
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Marketplace Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/equipment" element={<EquipmentList />} />
                  <Route path="/equipment/:id" element={<EquipmentDetail />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer Portal */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Equipment Owner Portal */}
                  <Route
                    path="/owner/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['owner', 'admin']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/equipment"
                    element={
                      <ProtectedRoute allowedRoles={['owner', 'admin']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/bookings"
                    element={
                      <ProtectedRoute allowedRoles={['owner', 'admin']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/equipment/new"
                    element={
                      <ProtectedRoute allowedRoles={['owner', 'admin']}>
                        <EquipmentForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/equipment/edit/:id"
                    element={
                      <ProtectedRoute allowedRoles={['owner', 'admin']}>
                        <EquipmentForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Administrator Portal */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/equipment"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* Persistent Floating Compare Drawer */}
              <CompareDrawer />

              <Footer />
            </div>
          </CompareProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
