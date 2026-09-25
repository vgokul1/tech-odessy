import React from 'react';
import { useAuth } from '../context/AuthContext';

const DemoLoginBar = () => {
  const { user, quickDemoLogin, logout } = useAuth();

  return (
    <div className="demo-bar py-1">
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark me-1">
            <i className="bi bi-lightning-fill me-1"></i>Quick Switcher:
          </span>
          <span className="small text-light d-none d-md-inline">
            Test personas with 1 click:
          </span>
          <button
            type="button"
            className={`btn btn-sm py-0 px-2 rounded-pill ${
              user?.role === 'customer' ? 'btn-success fw-bold' : 'btn-outline-light'
            }`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => quickDemoLogin('customer')}
          >
            <i className="bi bi-person me-1"></i>Customer (John)
          </button>
          <button
            type="button"
            className={`btn btn-sm py-0 px-2 rounded-pill ${
              user?.role === 'owner' ? 'btn-info fw-bold' : 'btn-outline-light'
            }`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => quickDemoLogin('owner')}
          >
            <i className="bi bi-briefcase me-1"></i>Rental Owner (Apex)
          </button>
          <button
            type="button"
            className={`btn btn-sm py-0 px-2 rounded-pill ${
              user?.role === 'admin' ? 'btn-danger fw-bold' : 'btn-outline-light'
            }`}
            style={{ fontSize: '0.78rem' }}
            onClick={() => quickDemoLogin('admin')}
          >
            <i className="bi bi-shield-lock me-1"></i>Admin (Vance)
          </button>
        </div>

        {user && (
          <div className="d-flex align-items-center gap-2 small">
            <span className="text-secondary d-none d-sm-inline">
              Active: <strong className="text-white">{user.name}</strong> ({user.role})
            </span>
            <button
              onClick={logout}
              className="btn btn-sm btn-link text-warning p-0 text-decoration-none"
              style={{ fontSize: '0.8rem' }}
            >
              <i className="bi bi-box-arrow-right me-1"></i>Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoLoginBar;
