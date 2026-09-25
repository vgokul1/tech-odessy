import React, { useState, useEffect } from 'react';
import API from '../services/api';
import CategoryFormModal from '../components/CategoryFormModal';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'users', 'categories', 'equipment'

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, usersRes, catRes, eqRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/bookings/admin/all'),
        API.get('/auth/users'),
        API.get('/categories'),
        API.get('/equipment?limit=100'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (eqRes.data.success) setEquipmentList(eqRes.data.equipment);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await API.put(`/auth/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await API.delete(`/categories/${catId}`);
      if (res.data.success) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category.');
    }
  };

  const handleDeleteEquipment = async (eqId) => {
    if (!window.confirm('Delete this listing from platform?')) return;
    try {
      const res = await API.delete(`/equipment/${eqId}`);
      if (res.data.success) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove equipment listing.');
    }
  };

  return (
    <div className="py-4 bg-light">
      <div className="container">
        {/* Header */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-dark text-white">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="badge bg-danger mb-2">SYSTEM ADMINISTRATOR CONSOLE</div>
              <h3 className="fw-bold mb-1">RentalHub Marketplace Management</h3>
              <p className="text-secondary small mb-0">
                Supervise transactions, verify fleet owners, moderate machinery inventory, and maintain categories.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="btn btn-warning fw-bold px-3"
            >
              <i className="bi bi-folder-plus me-1"></i>New Category
            </button>
          </div>
        </div>

        {/* Platform KPIs */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">GROSS MERCHANDISE VALUE</span>
              <h3 className="fw-bold text-primary mt-1 mb-0">${stats?.totalGMV || 0}</h3>
              <div className="text-muted small">Platform transaction volume</div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">TOTAL PLATFORM BOOKINGS</span>
              <h3 className="fw-bold text-success mt-1 mb-0">{stats?.totalBookings || 0}</h3>
              <div className="text-muted small">Rentals across all fleets</div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">EQUIPMENT LISTINGS</span>
              <h3 className="fw-bold text-warning mt-1 mb-0">{stats?.totalEquipment || 0}</h3>
              <div className="text-muted small">{stats?.totalCategories || 0} active categories</div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">REGISTERED USERS</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats?.totalUsers || 0}</h3>
              <div className="text-muted small">{stats?.ownerCount || 0} Owners • {stats?.customerCount || 0} Customers</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 border-bottom pb-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'bookings' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <i className="bi bi-receipt me-2"></i>Global Bookings Ledger ({bookings.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'users' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people me-2"></i>User Accounts ({users.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'categories' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('categories')}
                >
                  <i className="bi bi-tags me-2"></i>Categories ({categories.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'equipment' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('equipment')}
                >
                  <i className="bi bi-truck me-2"></i>Equipment Listings ({equipmentList.length})
                </button>
              </li>
            </ul>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : activeTab === 'bookings' ? (
            /* Global Bookings Table */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Ref #</th>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Owner</th>
                    <th>Window</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold small">{b.bookingReference}</td>
                      <td>{b.equipment?.title}</td>
                      <td>
                        <span className="fw-bold">{b.customer?.name}</span>
                        <div className="text-muted small">{b.customer?.email}</div>
                      </td>
                      <td>
                        <span className="fw-bold">{b.owner?.companyName || b.owner?.name}</span>
                        <div className="text-muted small">{b.owner?.email}</div>
                      </td>
                      <td className="small">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold text-primary">${b.totalAmount}</td>
                      <td>
                        <span className="badge bg-secondary">{b.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'users' ? (
            /* User Management Table */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Joined</th>
                    <th className="text-end">Change Access Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={u.avatar || 'https://via.placeholder.com/40'}
                            alt="Avatar"
                            className="rounded-circle"
                            width="36"
                            height="36"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold text-dark">{u.name}</div>
                            <div className="text-muted small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'bg-danger'
                              : u.role === 'owner'
                              ? 'bg-info text-dark'
                              : 'bg-success'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="small">{u.companyName || 'Individual'}</td>
                      <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="owner">Equipment Owner</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'categories' ? (
            /* Categories Table */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Equipment Count</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <i className={`bi ${c.icon || 'bi-tools'} fs-4 text-primary`}></i>
                      </td>
                      <td className="fw-bold">{c.name}</td>
                      <td className="small text-muted">{c.slug}</td>
                      <td className="small text-muted text-truncate" style={{ maxWidth: '300px' }}>
                        {c.description}
                      </td>
                      <td>
                        <span className="badge bg-secondary">{c.equipmentCount || 0} Units</span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            setEditingCategory(c);
                            setShowCategoryModal(true);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCategory(c._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Equipment Moderation */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Daily Rate</th>
                    <th>Rating</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq) => (
                    <tr key={eq._id}>
                      <td>
                        <span className="fw-bold">{eq.title}</span>
                        <div className="small text-muted">{eq.location?.city}, {eq.location?.state}</div>
                      </td>
                      <td>{eq.category?.name}</td>
                      <td>{eq.owner?.companyName || eq.owner?.name}</td>
                      <td className="fw-bold">${eq.dailyRate}/day</td>
                      <td>
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {eq.rating} ({eq.numReviews})
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteEquipment(eq._id)}
                        >
                          Remove Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryFormModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categoryToEdit={editingCategory}
        onSaved={fetchAdminData}
      />
    </div>
  );
};

export default AdminDashboardPage;
