import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCompare } from '../context/CompareContext';

const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isOwner, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { count: compareCount } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="brand-icon">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <span>Rental<span className="text-primary">Hub</span></span>
        </Link>

        {/* Mobile toggle button */}
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
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 align-items-lg-center">
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ${location.pathname === '/equipment' ? 'active text-primary fw-semibold' : ''}`}
                to="/equipment"
              >
                <i className="bi bi-grid me-1"></i> Browse Equipment
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ${location.pathname === '/compare' ? 'active text-primary fw-semibold' : ''}`}
                to="/compare"
              >
                <i className="bi bi-arrow-left-right me-1"></i> Compare
                {compareCount > 0 && (
                  <span className="badge bg-primary rounded-pill ms-1">{compareCount}</span>
                )}
              </Link>
            </li>
          </ul>

          {/* Right Section Actions & User Menu */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                {/* Role Switch Shortcut / Add Listing CTA */}
                {isOwner && (
                  <Link to="/owner/equipment/new" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    <i className="bi bi-plus-circle me-1"></i> List Equipment
                  </Link>
                )}

                {/* Notifications Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-dark position-relative rounded-circle p-2"
                    type="button"
                    id="notificationDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Notifications"
                  >
                    <i className="bi bi-bell fs-5 text-light"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="dropdown-menu dropdown-menu-end shadow-lg notification-menu p-0" aria-labelledby="notificationDropdown">
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm text-decoration-none p-0 text-primary"
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.8rem' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="list-group list-group-flush">
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted small">
                          <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n._id}
                            className={`list-group-item list-group-item-action p-3 ${!n.isRead ? 'bg-primary-subtle' : ''}`}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                              if (n.link) navigate(n.link);
                            }}
                            role="button"
                          >
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="fw-semibold small text-dark">{n.title}</span>
                              <span className="badge bg-secondary-subtle text-dark" style={{ fontSize: '0.65rem' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mb-0 text-muted small text-truncate-2" style={{ fontSize: '0.8rem' }}>
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* User Profile Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary text-light d-flex align-items-center gap-2 border-0 py-1 px-2 rounded-pill"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name}
                      className="rounded-circle"
                      width="32"
                      height="32"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
                    <i className="bi bi-chevron-down small"></i>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-lg py-2 mt-2" aria-labelledby="userDropdown">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold text-dark">{user?.name}</div>
                      <div className="text-muted small mb-1">{user?.email}</div>
                      <span className={`badge badge-role-${user?.role} text-capitalize`}>
                        {user?.role} Account
                      </span>
                    </li>

                    {/* Role Specific Navigation */}
                    {isCustomer && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/dashboard">
                            <i className="bi bi-clock-history me-2 text-primary"></i> My Rentals & Bookings
                          </Link>
                        </li>
                      </>
                    )}

                    {isOwner && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/owner/dashboard">
                            <i className="bi bi-speedometer2 me-2 text-primary"></i> Owner Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/owner/equipment">
                            <i className="bi bi-boxes me-2 text-primary"></i> Manage Inventory
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/owner/bookings">
                            <i className="bi bi-calendar-check me-2 text-primary"></i> Booking Requests
                          </Link>
                        </li>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin">
                            <i className="bi bi-shield-check me-2 text-purple text-primary"></i> Admin Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin/users">
                            <i className="bi bi-people me-2 text-primary"></i> User Management
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin/equipment">
                            <i className="bi bi-tools me-2 text-primary"></i> Platform Listings
                          </Link>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-sm">
                  Sign Up
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
