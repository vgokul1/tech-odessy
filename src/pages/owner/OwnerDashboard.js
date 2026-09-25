import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

const OwnerDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'listings'
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Blocked Dates Modal state
  const [selectedEquipmentForHold, setSelectedEquipmentForHold] = useState(null);
  const [holdStart, setHoldStart] = useState('');
  const [holdEnd, setHoldEnd] = useState('');
  const [holdReason, setHoldReason] = useState('Routine maintenance & service');
  const [holdLoading, setHoldLoading] = useState(false);

  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, bookRes] = await Promise.all([
        equipmentAPI.getMyListings(),
        bookingAPI.getOwnerBookings({ status: bookingFilter !== 'all' ? bookingFilter : undefined }),
      ]);

      if (listRes.data.success) {
        setListings(listRes.data.data);
      }
      if (bookRes.data.success) {
        setBookings(bookRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingFilter]);

  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  // Update Booking Status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await bookingAPI.updateStatus(bookingId, { status: newStatus });
      if (res.data.success) {
        setAlertMsg({ text: `Booking successfully updated to ${newStatus.toUpperCase()}`, type: 'success' });
        fetchOwnerData();
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error updating status', type: 'danger' });
    }
  };

  // Toggle Equipment Availability
  const handleToggleAvailability = async (equipment) => {
    try {
      const updatedStatus = !equipment.isAvailable;
      const res = await equipmentAPI.update(equipment._id, { isAvailable: updatedStatus });
      if (res.data.success) {
        setListings((prev) =>
          prev.map((e) => (e._id === equipment._id ? { ...e, isAvailable: updatedStatus } : e))
        );
        setAlertMsg({
          text: `Listing is now ${updatedStatus ? 'AVAILABLE' : 'HIDDEN/UNAVAILABLE'}`,
          type: 'info',
        });
      }
    } catch (err) {
      setAlertMsg({ text: 'Error toggling availability', type: 'danger' });
    }
  };

  // Delete Equipment Listing
  const handleDeleteEquipment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await equipmentAPI.delete(id);
      if (res.data.success) {
        setAlertMsg({ text: 'Listing deleted successfully.', type: 'info' });
        setListings((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Cannot delete listing with active bookings', type: 'danger' });
    }
  };

  // Blocked Dates Handlers
  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!selectedEquipmentForHold || !holdStart || !holdEnd) return;
    try {
      setHoldLoading(true);
      const res = await equipmentAPI.addBlockedDate(selectedEquipmentForHold._id, {
        startDate: holdStart,
        endDate: holdEnd,
        reason: holdReason,
      });
      if (res.data.success) {
        setSelectedEquipmentForHold((prev) => ({ ...prev, blockedDates: res.data.data }));
        setHoldStart('');
        setHoldEnd('');
        setAlertMsg({ text: 'Maintenance hold period added to calendar', type: 'success' });
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error adding blocked date', type: 'danger' });
    } finally {
      setHoldLoading(false);
    }
  };

  const handleRemoveBlockedDate = async (blockId) => {
    try {
      const res = await equipmentAPI.removeBlockedDate(selectedEquipmentForHold._id, blockId);
      if (res.data.success) {
        setSelectedEquipmentForHold((prev) => ({ ...prev, blockedDates: res.data.data }));
      }
    } catch (err) {
      setAlertMsg({ text: 'Error removing blocked date', type: 'danger' });
    }
  };

  // Calculate Metrics
  const totalEarnings = listings.reduce((sum, item) => sum + (item.stats?.totalEarnings || 0), 0);
  const activeRentalsCount = bookings.filter((b) => b.status === 'active').length;
  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="container py-4">
      {/* Profile & Business Header */}
      <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="rounded-circle shadow-sm"
              width="64"
              height="64"
              style={{ objectFit: 'cover' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold mb-0">{user?.companyName || user?.name}</h4>
                <span className="badge badge-role-owner text-capitalize">Owner / Business</span>
              </div>
              <div className="text-muted small">
                {user?.name} • {user?.email} • {user?.phone || 'No phone set'}
              </div>
            </div>
          </div>
          <div>
            <Link to="/owner/equipment/new" className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-plus-lg me-1"></i> Add Equipment Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Total Equipment</span>
              <div className="metric-icon-wrap bg-primary-subtle text-primary">
                <i className="bi bi-boxes"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0">{listings.length}</h3>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Total Revenue</span>
              <div className="metric-icon-wrap bg-success-subtle text-success">
                <i className="bi bi-currency-dollar"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0 text-success">${totalEarnings}</h3>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Active Rentals</span>
              <div className="metric-icon-wrap bg-info-subtle text-info">
                <i className="bi bi-arrow-repeat"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0">{activeRentalsCount}</h3>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small fw-semibold text-uppercase">Pending Requests</span>
              <div className="metric-icon-wrap bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <h3 className="fw-extrabold mb-0 text-warning">{pendingRequestsCount}</h3>
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

      {/* Main Tabs Navigation */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Booking Requests &amp; Fulfillment
            {pendingRequestsCount > 0 && (
              <span className="badge bg-danger ms-2">{pendingRequestsCount} new</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <i className="bi bi-tools me-2"></i>
            My Equipment Listings ({listings.length})
          </button>
        </li>
      </ul>

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0">Booking Lifecycle Management</h5>
              <span className="text-muted small">Confirm reservations, track active deployments, and release returns</span>
            </div>

            <div className="btn-group btn-group-sm" role="group">
              {['all', 'pending', 'confirmed', 'active', 'returned', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn text-capitalize ${bookingFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setBookingFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5 border rounded-3 bg-light p-4">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
              <h6>No Booking Requests</h6>
              <p className="text-muted small mb-0">No bookings match the selected status filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Equipment</th>
                    <th>Customer</th>
                    <th>Rental Dates</th>
                    <th>Financials</th>
                    <th>Status</th>
                    <th className="text-end">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      {/* Equipment */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={b.equipment?.images?.[0]}
                            alt={b.equipment?.title}
                            className="rounded shadow-sm"
                            width="48"
                            height="40"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold small text-dark">{b.equipment?.title}</div>
                            <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                              #{b._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="fw-semibold small">{b.customer?.name}</div>
                        <div className="text-muted small">{b.customer?.email}</div>
                        <div className="text-muted small">{b.customer?.phone}</div>
                        {b.deliveryMethod === 'delivery' && (
                          <div className="text-primary small" style={{ fontSize: '0.72rem' }}>
                            <i className="bi bi-truck me-1"></i> Deliver to: {b.deliveryAddress}
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td>
                        <div className="small fw-semibold">
                          {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted small">{b.totalDays} day(s)</div>
                      </td>

                      {/* Financials */}
                      <td>
                        <div className="fw-bold text-dark">${b.totalAmount}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Rent: ${b.rentAmount} | Deposit: ${b.securityDeposit}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          {b.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm rounded-pill px-2.5 py-1"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                              >
                                <i className="bi bi-check-lg me-1"></i> Accept
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleUpdateStatus(b._id, 'rejected')}
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              className="btn btn-primary btn-sm rounded-pill px-2.5 py-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleUpdateStatus(b._id, 'active')}
                            >
                              <i className="bi bi-arrow-repeat me-1"></i> Mark Active
                            </button>
                          )}

                          {b.status === 'active' && (
                            <button
                              className="btn btn-secondary btn-sm rounded-pill px-2.5 py-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleUpdateStatus(b._id, 'returned')}
                            >
                              <i className="bi bi-check2-all me-1"></i> Mark Returned
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Equipment Listings */}
      {activeTab === 'listings' && (
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">My Equipment Inventory</h5>
              <span className="text-muted small">Manage pricing, edit specifications, and set calendar maintenance holds</span>
            </div>
            <Link to="/owner/equipment/new" className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-plus-lg me-1"></i> Add New Equipment
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-5 border rounded-3 bg-light p-4">
              <i className="bi bi-boxes fs-1 text-muted d-block mb-2"></i>
              <h6>No Equipment Listed Yet</h6>
              <p className="text-muted small mb-3">Start monetizing your tools and heavy machinery by adding your first listing.</p>
              <Link to="/owner/equipment/new" className="btn btn-primary btn-sm rounded-pill px-4">
                Add Listing Now
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Daily Rate</th>
                    <th>Deposit</th>
                    <th>Availability</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((eq) => (
                    <tr key={eq._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={eq.images?.[0]}
                            alt={eq.title}
                            className="rounded shadow-sm"
                            width="50"
                            height="44"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <Link to={`/equipment/${eq._id}`} className="fw-bold small text-dark text-decoration-none hover-primary">
                              {eq.title}
                            </Link>
                            <div className="text-muted small">
                              {eq.condition} • {eq.rating > 0 ? `${eq.rating} ★ (${eq.numReviews})` : 'New'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-light text-primary text-uppercase font-monospace small">
                          {eq.category?.name || 'General'}
                        </span>
                      </td>

                      <td>
                        <span className="fw-bold text-dark">${eq.dailyRate}</span> / day
                      </td>

                      <td>
                        <span className="text-muted small">${eq.securityDeposit || 0}</span>
                      </td>

                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={eq.isAvailable}
                            onChange={() => handleToggleAvailability(eq)}
                          />
                          <label className="form-check-label small">
                            {eq.isAvailable ? (
                              <span className="text-success fw-semibold">Available</span>
                            ) : (
                              <span className="text-muted">Hidden</span>
                            )}
                          </label>
                        </div>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {/* Manage Blocked Dates */}
                          <button
                            className="btn btn-outline-secondary btn-sm rounded-pill px-2.5 py-1"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setSelectedEquipmentForHold(eq)}
                            title="Manage maintenance blackout dates"
                          >
                            <i className="bi bi-calendar-x me-1"></i> Holds
                            {eq.blockedDates?.length > 0 && (
                              <span className="badge bg-warning text-dark ms-1">{eq.blockedDates.length}</span>
                            )}
                          </button>

                          {/* Edit Listing */}
                          <Link
                            to={`/owner/equipment/edit/${eq._id}`}
                            className="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>

                          {/* Delete Listing */}
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleDeleteEquipment(eq._id, eq.title)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Blocked Dates Modal */}
      {selectedEquipmentForHold && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">Manage Calendar Holds &amp; Maintenance</h5>
                  <div className="text-muted small">{selectedEquipmentForHold.title}</div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedEquipmentForHold(null)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Form to add blackout date */}
                <form onSubmit={handleAddBlockedDate} className="bg-light p-3 rounded-3 mb-4 border">
                  <h6 className="fw-bold mb-2 small text-uppercase">Block Dates for Maintenance or Private Use</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted mb-1">Start Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={holdStart}
                        onChange={(e) => setHoldStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted mb-1">End Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        min={holdStart}
                        value={holdEnd}
                        onChange={(e) => setHoldEnd(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted mb-1">Reason</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Hydraulic inspection"
                        value={holdReason}
                        onChange={(e) => setHoldReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="text-end mt-2">
                    <button
                      type="submit"
                      className="btn btn-warning btn-sm rounded-pill px-3 fw-bold"
                      disabled={holdLoading || !holdStart || !holdEnd}
                    >
                      {holdLoading ? 'Adding...' : '+ Add Calendar Hold'}
                    </button>
                  </div>
                </form>

                {/* Existing Blocked Dates */}
                <h6 className="fw-bold mb-2 small text-uppercase">Current Blocked Date Ranges</h6>
                {(!selectedEquipmentForHold.blockedDates || selectedEquipmentForHold.blockedDates.length === 0) ? (
                  <p className="text-muted small">No dates currently blocked for this equipment.</p>
                ) : (
                  <ul className="list-group list-group-flush border rounded-3">
                    {selectedEquipmentForHold.blockedDates.map((block) => (
                      <li key={block._id} className="list-group-item d-flex justify-content-between align-items-center py-2">
                        <div>
                          <strong>{new Date(block.startDate).toLocaleDateString()}</strong> &rarr;{' '}
                          <strong>{new Date(block.endDate).toLocaleDateString()}</strong>
                          <span className="badge bg-secondary-subtle text-dark ms-2">{block.reason}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-circle p-1"
                          style={{ width: '26px', height: '26px', lineHeight: 1 }}
                          onClick={() => handleRemoveBlockedDate(block._id)}
                          title="Remove blackout"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-3"
                  onClick={() => setSelectedEquipmentForHold(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
