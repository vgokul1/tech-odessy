import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import EquipmentFormModal from '../components/EquipmentFormModal';

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'inventory'

  // Equipment Form Modal
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, inventoryRes, catRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/bookings/owner-bookings'),
        API.get('/equipment/owner/me'),
        API.get('/categories'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (inventoryRes.data.success) setInventory(inventoryRes.data.equipment);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Error loading owner dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    let notes = '';
    if (newStatus === 'confirmed') notes = 'Booking approved by owner';
    if (newStatus === 'active') notes = 'Machine handed over / dispatched to customer';
    if (newStatus === 'returned') notes = 'Machine returned, inspected, and checked back into yard';
    if (newStatus === 'rejected') {
      notes = window.prompt('Please specify rejection reason:') || 'Unavailable';
    }

    try {
      setUpdatingId(bookingId);
      const res = await API.put(`/bookings/${bookingId}/status`, { status: newStatus, notes });
      if (res.data.success) {
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this equipment listing?')) return;
    try {
      const res = await API.delete(`/equipment/${id}`);
      if (res.data.success) {
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete equipment.');
    }
  };

  return (
    <div className="py-4 bg-light">
      <div className="container">
        {/* Owner Business Header */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="rounded-circle border"
                width="64"
                height="64"
                style={{ objectFit: 'cover' }}
              />
              <div>
                <h4 className="fw-bold text-dark mb-1">{user?.companyName || user?.name}</h4>
                <div className="text-muted small">
                  <span className="badge bg-info text-dark me-2">VERIFIED FLEET OWNER</span>
                  {user?.address?.city || 'Austin'}, {user?.address?.state || 'TX'} • {user?.phone}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingEquipment(null);
                setShowEquipmentModal(true);
              }}
              className="btn btn-warning fw-bold px-4 shadow-sm"
            >
              <i className="bi bi-plus-circle-fill me-2"></i>Add Equipment Listing
            </button>
          </div>
        </div>

        {/* Fleet KPI Metrics */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">TOTAL LISTINGS</span>
                  <h3 className="fw-bold text-dark mt-1 mb-0">{stats?.totalListings || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-primary fs-4">
                  <i className="bi bi-truck"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">ACTIVE RENTALS</span>
                  <h3 className="fw-bold text-success mt-1 mb-0">{stats?.activeRentals || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-success fs-4">
                  <i className="bi bi-play-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">PENDING APPROVALS</span>
                  <h3 className="fw-bold text-warning mt-1 mb-0">{stats?.pendingRequests || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-warning fs-4">
                  <i className="bi bi-bell-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">TOTAL FLEET REVENUE</span>
                  <h3 className="fw-bold text-dark mt-1 mb-0">${stats?.totalRevenue || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-info fs-4">
                  <i className="bi bi-cash-stack"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 border-bottom pb-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'bookings' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  Customer Booking Requests ({bookings.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-bold ${activeTab === 'inventory' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  <i className="bi bi-tools me-2"></i>
                  My Fleet Inventory ({inventory.length})
                </button>
              </li>
            </ul>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : activeTab === 'bookings' ? (
            /* Bookings Tab */
            bookings.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 mb-2 d-block"></i>
                No customer bookings received yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Ref & Equipment</th>
                      <th>Renter Customer</th>
                      <th>Rental Dates</th>
                      <th>Total Payout</th>
                      <th>Status</th>
                      <th className="text-end">Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <span className="badge bg-dark small d-block mb-1" style={{ width: 'fit-content' }}>
                            {b.bookingReference}
                          </span>
                          <span className="fw-bold text-dark">{b.equipment?.title}</span>
                          <div className="text-muted small">
                            ${b.dailyRate}/day • {b.deliveryOption === 'delivery' ? 'Site Delivery' : 'Yard Pickup'}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{b.customer?.name}</div>
                          <div className="text-muted small">{b.customer?.email}</div>
                          <div className="text-muted small">{b.customer?.phone}</div>
                        </td>
                        <td>
                          <div className="small fw-bold">
                            {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted small">{b.rentalDays} Day(s)</div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">${b.equipmentSubtotal}</div>
                          <div className="text-muted small">+${b.securityDeposit} deposit</div>
                        </td>
                        <td>
                          <span
                            className={`badge px-2 py-1 ${
                              b.status === 'pending'
                                ? 'badge-status-pending'
                                : b.status === 'confirmed'
                                ? 'badge-status-confirmed'
                                : b.status === 'active'
                                ? 'badge-status-active'
                                : b.status === 'returned'
                                ? 'badge-status-returned'
                                : 'badge-status-cancelled'
                            }`}
                          >
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {/* If pending -> Confirm or Reject */}
                            {b.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success fw-bold"
                                  disabled={updatingId === b._id}
                                  onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                                  title="Approve rental reservation"
                                >
                                  <i className="bi bi-check-lg me-1"></i>Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={updatingId === b._id}
                                  onClick={() => handleUpdateStatus(b._id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* If confirmed -> Dispatch / Activate */}
                            {b.status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary fw-bold"
                                disabled={updatingId === b._id}
                                onClick={() => handleUpdateStatus(b._id, 'active')}
                              >
                                <i className="bi bi-truck me-1"></i>Dispatch / Start
                              </button>
                            )}

                            {/* If active -> Check-in / Mark Returned */}
                            {b.status === 'active' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary fw-bold"
                                disabled={updatingId === b._id}
                                onClick={() => handleUpdateStatus(b._id, 'returned')}
                              >
                                <i className="bi bi-box-arrow-in-down-left me-1"></i>Check-In / Return
                              </button>
                            )}

                            {b.status === 'returned' && (
                              <span className="badge bg-light text-muted border">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Inventory Tab */
            inventory.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-tools fs-1 mb-2 d-block"></i>
                You haven't listed any equipment yet. Click "Add Equipment Listing" above to get started!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Image</th>
                      <th>Equipment Title</th>
                      <th>Category</th>
                      <th>Daily Rate</th>
                      <th>Deposit</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item._id}>
                        <td style={{ width: '80px' }}>
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={item.title}
                            className="rounded"
                            style={{ width: '60px', height: '45px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <span className="fw-bold text-dark">{item.title}</span>
                          <div className="text-muted small">{item.location?.city}, {item.location?.state}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {item.category?.name || 'Category'}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">${item.dailyRate}/day</td>
                        <td className="text-muted">${item.securityDeposit}</td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary">{item.condition}</span>
                        </td>
                        <td>
                          <span className={`badge ${item.availability?.isAvailable ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {item.availability?.isAvailable ? 'Available' : 'Paused / Blocked'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setEditingEquipment(item);
                              setShowEquipmentModal(true);
                            }}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteEquipment(item._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Equipment Add/Edit Modal */}
      <EquipmentFormModal
        show={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        equipmentToEdit={editingEquipment}
        onSaved={fetchDashboardData}
        categories={categories}
      />
    </div>
  );
};

export default OwnerDashboardPage;
