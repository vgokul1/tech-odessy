import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOwner, isCustomer } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" to="/">
          <span className="p-2 rounded bg-warning text-dark d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <i className="bi bi-gear-wide-connected fs-5"></i>
          </span>
          <span>Rental<span className="text-warning">Hub</span></span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Main Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/catalog">
                <i className="bi bi-grid me-1"></i>Browse Equipment
              </NavLink>
            </li>

            {isCustomer && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard/customer">
                  <i className="bi bi-clock-history me-1"></i>My Rentals
                </NavLink>
              </li>
            )}

            {isOwner && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard/owner">
                    <i className="bi bi-speedometer2 me-1"></i>Owner Portal
                  </NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link text-warning" to="/dashboard/admin">
                  <i className="bi bi-shield-lock-fill me-1"></i>Admin Hub
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action Menu */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="position-relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn btn-outline-secondary text-light border-0 position-relative p-2"
                    title="Notifications"
                  >
                    <i className="bi bi-bell-fill fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {showNotifications && (
                    <div
                      className="card shadow-lg position-absolute end-0 mt-2 p-0 border-0"
                      style={{ width: '320px', zIndex: 1050, maxHeight: '420px', overflowY: 'auto' }}
                    >
                      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-2 px-3">
                        <span className="fw-bold small">
                          <i className="bi bi-bell me-1"></i>Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="btn btn-link btn-sm text-warning p-0 text-decoration-none small"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted small">
                            No notifications at this time
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                setShowNotifications(false);
                                if (n.link) navigate(n.link);
                              }}
                              className={`list-group-item list-group-item-action p-2 cursor-pointer ${
                                !n.isRead ? 'bg-light border-start border-4 border-warning' : ''
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <strong className="small text-dark">{n.title}</strong>
                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted mb-0 small text-truncate">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-dark d-flex align-items-center gap-2 border border-secondary rounded-pill px-3 py-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="rounded-circle"
                      width="26"
                      height="26"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="text-white small fw-bold">{user?.name?.split(' ')[0]}</span>
                    <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : user?.role === 'owner' ? 'bg-info text-dark' : 'bg-success'}`} style={{ fontSize: '0.65rem' }}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li>
                      <h6 className="dropdown-header">Signed in as {user?.email}</h6>
                    </li>
                    {isCustomer && (
                      <li>
                        <Link className="dropdown-item" to="/dashboard/customer">
                          <i className="bi bi-clock-history me-2"></i>My Bookings
                        </Link>
                      </li>
                    )}
                    {isOwner && (
                      <li>
                        <Link className="dropdown-item" to="/dashboard/owner">
                          <i className="bi bi-speedometer2 me-2"></i>Owner Dashboard
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <Link className="dropdown-item text-danger" to="/dashboard/admin">
                          <i className="bi bi-shield-lock me-2"></i>Admin Console
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-warning btn-sm px-3 fw-bold">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
