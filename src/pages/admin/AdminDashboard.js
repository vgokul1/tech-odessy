import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, categoryAPI, reviewAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import StarRating from '../../components/StarRating';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, equipment, categories, bookings, reviews
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Users filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('bi-tools');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Fetch Admin Stats & Overview
  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const res = await adminAPI.getUsers(params);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [userRoleFilter, userSearch]);

  // Fetch Equipment
  const fetchEquipment = async () => {
    try {
      const res = await adminAPI.getAllEquipment();
      if (res.data.success) {
        setEquipmentList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching equipment list:', err);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const res = await adminAPI.getAllBookings();
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await adminAPI.getAllReviews();
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchEquipment(),
        fetchCategories(),
        fetchBookings(),
        fetchReviews(),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchUsers]);

  // User status toggle
  const handleToggleUserStatus = async (userObj) => {
    try {
      const newStatus = !userObj.isActive;
      const res = await adminAPI.updateUserStatus(userObj._id, { isActive: newStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userObj._id ? { ...u, isActive: newStatus } : u))
        );
        setAlertMsg({ text: `User ${userObj.name} status updated to ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`, type: 'info' });
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error updating user', type: 'danger' });
    }
  };

  // User role change
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateUserStatus(userId, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setAlertMsg({ text: `User role changed to ${newRole.toUpperCase()}`, type: 'success' });
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error changing role', type: 'danger' });
    }
  };

  // Equipment toggle
  const handleToggleFeatured = async (eq) => {
    try {
      const newFeatured = !eq.isFeatured;
      const res = await adminAPI.toggleEquipment(eq._id, { isFeatured: newFeatured });
      if (res.data.success) {
        setEquipmentList((prev) =>
          prev.map((item) => (item._id === eq._id ? { ...item, isFeatured: newFeatured } : item))
        );
      }
    } catch (err) {
      setAlertMsg({ text: 'Error toggling featured status', type: 'danger' });
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setCatSubmitting(true);
      const res = await categoryAPI.create({
        name: newCatName,
        slug: newCatSlug,
        icon: newCatIcon,
        description: newCatDesc,
        image: newCatImage,
      });
      if (res.data.success) {
        setAlertMsg({ text: `Category "${newCatName}" created!`, type: 'success' });
        setShowCategoryModal(false);
        setNewCatName('');
        setNewCatSlug('');
        setNewCatDesc('');
        fetchCategories();
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error creating category', type: 'danger' });
    } finally {
      setCatSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await categoryAPI.delete(id);
      if (res.data.success) {
        setAlertMsg({ text: `Category "${name}" removed.`, type: 'info' });
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error deleting category', type: 'danger' });
    }
  };

  // Delete Review
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      const res = await reviewAPI.delete(id);
      if (res.data.success) {
        setAlertMsg({ text: 'Review deleted and equipment ratings recalculated.', type: 'info' });
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      setAlertMsg({ text: 'Error deleting review', type: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading administrative console...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-dark text-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-icon bg-primary" style={{ width: '56px', height: '56px', fontSize: '1.6rem' }}>
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0">Platform Administration Console</h3>
              <div className="text-light text-opacity-75 small">
                Oversee users, equipment inventory, marketplace bookings, categories, and financials
              </div>
            </div>
          </div>
          <span className="badge bg-primary px-3 py-2 rounded-pill font-monospace small">
            SuperAdmin Active
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Gross Volume</span>
              <div className="metric-icon-wrap bg-success-subtle text-success">
                <i className="bi bi-cash-stack"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0">${stats?.financials?.grossVolume || 0}</h3>
            <div className="text-muted small mt-1">Platform GMV</div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Est. Revenue (10%)</span>
              <div className="metric-icon-wrap bg-primary-subtle text-primary">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0 text-primary">${stats?.financials?.platformRevenue || 0}</h3>
            <div className="text-muted small mt-1">Marketplace take</div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Total Users</span>
              <div className="metric-icon-wrap bg-info-subtle text-info">
                <i className="bi bi-people"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0">{stats?.users?.total || 0}</h3>
            <div className="text-muted small mt-1">
              {stats?.users?.customers || 0} Renters • {stats?.users?.owners || 0} Owners
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Total Listings</span>
              <div className="metric-icon-wrap bg-warning-subtle text-warning">
                <i className="bi bi-tools"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0">{stats?.equipment?.total || 0}</h3>
            <div className="text-muted small mt-1">{stats?.equipment?.available || 0} available</div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show small mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-1"></i> Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> Users ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            <i className="bi bi-boxes me-1"></i> Equipment ({equipmentList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="bi bi-tags me-1"></i> Categories ({categories.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-calendar2-range me-1"></i> Global Bookings ({bookings.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-3 ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="bi bi-star me-1"></i> Moderation ({reviews.length})
          </button>
        </li>
      </ul>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Recent Platform Bookings</h5>
              {stats?.recentBookings?.length === 0 ? (
                <p className="text-muted small">No recent bookings recorded.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats?.recentBookings?.map((b) => (
                    <div key={b._id} className="list-group-item d-flex justify-content-between align-items-center py-2.5">
                      <div>
                        <div className="fw-bold small">{b.equipment?.title}</div>
                        <div className="text-muted small">Rented by: {b.customer?.name} ({b.customer?.email})</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">${b.totalAmount}</div>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Recent User Registrations</h5>
              {stats?.recentUsers?.length === 0 ? (
                <p className="text-muted small">No recent registrations.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats?.recentUsers?.map((u) => (
                    <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center py-2.5">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="rounded-circle"
                          width="36"
                          height="36"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold small">{u.name}</div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                      <span className={`badge badge-role-${u.role} text-capitalize`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0">Platform User Directory</h5>
              <span className="text-muted small">Manage accounts, toggle active status, and assign permissions</span>
            </div>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search name/email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: '180px' }}
              />
              <select
                className="form-select form-select-sm"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ width: '140px' }}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="owner">Owners</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="rounded-circle shadow-sm"
                          width="38"
                          height="38"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold small">{u.name}</div>
                          {u.companyName && <div className="text-muted small">{u.companyName}</div>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="small">{u.email}</div>
                      <div className="text-muted small">{u.phone || 'No phone'}</div>
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm d-inline-block w-auto"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="text-end">
                      <button
                        className={`btn btn-sm rounded-pill px-3 ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleToggleUserStatus(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Equipment Management */}
      {activeTab === 'equipment' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Platform Equipment Catalog</h5>
              <span className="text-muted small">Promote listings to featured showcase or audit inventory</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Equipment Item</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Daily Rate</th>
                  <th>Featured on Home</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((eq) => (
                  <tr key={eq._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={eq.images?.[0]}
                          alt={eq.title}
                          className="rounded shadow-sm"
                          width="48"
                          height="40"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold small">{eq.title}</div>
                          <div className="text-muted small">{eq.condition} • {eq.rating} ★</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-primary text-uppercase font-monospace small">
                        {eq.category?.name || 'General'}
                      </span>
                    </td>

                    <td>
                      <div className="small fw-semibold">{eq.owner?.name}</div>
                      <div className="text-muted small">{eq.owner?.companyName || eq.owner?.email}</div>
                    </td>

                    <td>
                      <span className="fw-bold">${eq.dailyRate}</span> / day
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 ${eq.isFeatured ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleToggleFeatured(eq)}
                      >
                        <i className={`bi ${eq.isFeatured ? 'bi-lightning-fill' : 'bi-lightning'} me-1`}></i>
                        {eq.isFeatured ? 'Featured' : 'Make Featured'}
                      </button>
                    </td>

                    <td>
                      <span className={`badge ${eq.isAvailable ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {eq.isAvailable ? 'Available' : 'Unlisted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Categories Management */}
      {activeTab === 'categories' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Equipment Categories</h5>
              <span className="text-muted small">Manage classifications and taxonomy</span>
            </div>
            <button
              className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
              onClick={() => setShowCategoryModal(true)}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Category
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Icon</th>
                  <th>Equipment Count</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light p-2 rounded text-primary fs-5">
                          <i className={`bi ${c.icon}`}></i>
                        </div>
                        <div>
                          <div className="fw-bold small">{c.name}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                            {c.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-monospace small text-muted">{c.slug}</span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark font-monospace">{c.icon}</span>
                    </td>

                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {c.equipmentCount || 0} listings
                      </span>
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle p-1"
                        style={{ width: '28px', height: '28px', lineHeight: 1 }}
                        onClick={() => handleDeleteCategory(c._id, c.name)}
                        title="Delete Category"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Global Bookings */}
      {activeTab === 'bookings' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Platform-Wide Rental Bookings</h5>
              <span className="text-muted small">Global audit log of transactions and rental schedules</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Booking ID</th>
                  <th>Equipment</th>
                  <th>Customer</th>
                  <th>Owner</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace small fw-bold">
                      #{b._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="small fw-semibold">{b.equipment?.title}</td>
                    <td className="small">{b.customer?.name} ({b.customer?.email})</td>
                    <td className="small">{b.owner?.name} ({b.owner?.companyName})</td>
                    <td className="small">
                      {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="fw-bold">${b.totalAmount}</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Customer Reviews Moderation</h5>
              <span className="text-muted small">Monitor community ratings and remove abusive feedback</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Equipment</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td className="small fw-semibold">{rev.equipment?.title}</td>
                    <td>
                      <div className="small fw-semibold">{rev.customer?.name}</div>
                      <div className="text-muted small">{rev.customer?.email}</div>
                    </td>
                    <td>
                      <StarRating rating={rev.rating} showText={false} />
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: '320px' }}>
                      {rev.comment}
                    </td>
                    <td className="small text-muted">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleDeleteReview(rev._id)}
                      >
                        <i className="bi bi-trash me-1"></i> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Equipment Category</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCategoryModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Category Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Aerial Lifts & Scaffolding"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Slug</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Bootstrap Icon Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="bi-tools or bi-truck"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Cover Image URL</label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={newCatImage}
                      onChange={(e) => setNewCatImage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-pill px-3"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
                    disabled={catSubmitting || !newCatName.trim()}
                  >
                    {catSubmitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
