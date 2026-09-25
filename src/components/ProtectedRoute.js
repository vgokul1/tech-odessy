import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block p-4 rounded-4 shadow-sm">
          <i className="bi bi-shield-lock-fill fs-1 d-block mb-3 text-danger"></i>
          <h4>Access Denied</h4>
          <p className="mb-3 text-muted">
            Your role (<strong className="text-capitalize">{user.role}</strong>) does not have permission to view this section.
          </p>
          <a href="/" className="btn btn-outline-danger">Return to Home</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
