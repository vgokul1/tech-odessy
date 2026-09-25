import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Cancellation State
  const [cancellingId, setCancellingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/bookings/my-bookings'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching customer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (!reason) return;

    try {
      setCancellingId(bookingId);
      const res = await API.put(`/bookings/${bookingId}/cancel`, { reason });
      if (res.data.success) {
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-status-pending px-3 py-2">Pending Owner Approval</span>;
      case 'confirmed':
        return <span className="badge badge-status-confirmed px-3 py-2">Confirmed / Ready</span>;
      case 'active':
        return <span className="badge badge-status-active px-3 py-2">Active Rental in Field</span>;
      case 'returned':
        return <span className="badge badge-status-returned px-3 py-2">Returned & Inspected</span>;
      case 'cancelled':
        return <span className="badge badge-status-cancelled px-3 py-2">Cancelled</span>;
      case 'rejected':
        return <span className="badge badge-status-rejected px-3 py-2">Rejected by Owner</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'active') return b.status === 'active';
    if (filterTab === 'pending') return b.status === 'pending' || b.status === 'confirmed';
    if (filterTab === 'completed') return b.status === 'returned';
    return true;
  });

  return (
    <div className="py-4 bg-light">
      <div className="container">
        {/* Profile Banner */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="rounded-circle border"
                width="64"
                height="64"
                style={{ objectFit: 'cover' }}
              />
              <div>
                <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
                <div className="text-muted small">
                  <i className="bi bi-briefcase me-1"></i>
                  {user?.companyName || 'Private Contractor'} • {user?.email}
                </div>
              </div>
            </div>

            <Link to="/catalog" className="btn btn-warning fw-bold px-4">
              <i className="bi bi-search me-2"></i>Rent New Equipment
            </Link>
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">TOTAL BOOKINGS</span>
                  <h3 className="fw-bold text-dark mt-1 mb-0">{stats?.totalBookings || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-primary fs-4">
                  <i className="bi bi-calendar2-week"></i>
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
                  <i className="bi bi-play-circle"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">PENDING / CONFIRMED</span>
                  <h3 className="fw-bold text-warning mt-1 mb-0">{stats?.pendingBookings || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-warning fs-4">
                  <i className="bi bi-hourglass-split"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-bold">TOTAL RENTAL SPENT</span>
                  <h3 className="fw-bold text-dark mt-1 mb-0">${stats?.totalSpent || 0}</h3>
                </div>
                <div className="p-3 bg-light rounded text-info fs-4">
                  <i className="bi bi-credit-card"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Ledger / List */}
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 border-bottom pb-3">
            <h5 className="fw-bold text-dark mb-0">My Equipment Bookings & Rentals</h5>

            {/* Filter Tabs */}
            <ul className="nav nav-pills small">
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${filterTab === 'all' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setFilterTab('all')}
                >
                  All ({bookings.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${filterTab === 'active' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setFilterTab('active')}
                >
                  Active ({bookings.filter((b) => b.status === 'active').length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${filterTab === 'pending' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setFilterTab('pending')}
                >
                  Pending/Upcoming ({bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link py-1 px-3 ${filterTab === 'completed' ? 'active bg-primary' : 'text-dark'}`}
                  onClick={() => setFilterTab('completed')}
                >
                  Completed ({bookings.filter((b) => b.status === 'returned').length})
                </button>
              </li>
            </ul>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted small">Loading booking ledger...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-journal-x fs-1 text-secondary mb-2 d-block"></i>
              <h6>No bookings in this tab</h6>
              <p className="small">Ready to rent machinery? Browse the marketplace catalog.</p>
              <Link to="/catalog" className="btn btn-primary btn-sm fw-bold">
                Browse Equipment Catalog
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredBookings.map((b) => (
                <div key={b._id} className="card border rounded-3 p-3">
                  <div className="row g-3 align-items-center">
                    {/* Equipment photo */}
                    <div className="col-md-2 text-center text-md-start">
                      <img
                        src={b.equipment?.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={b.equipment?.title}
                        className="rounded"
                        style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Booking core info */}
                    <div className="col-md-5">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-dark small">{b.bookingReference}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <h6 className="fw-bold mb-1">
                        <Link to={`/equipment/${b.equipment?._id}`} className="text-dark text-decoration-none">
                          {b.equipment?.title}
                        </Link>
                      </h6>
                      <div className="small text-muted mb-1">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                        <span className="fw-bold text-dark ms-1">({b.rentalDays} Days)</span>
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-building me-1"></i>
                        Owner: {b.owner?.companyName || b.owner?.name} ({b.owner?.phone})
                      </div>
                    </div>

                    {/* Pricing & Fulfillment */}
                    <div className="col-md-3">
                      <div className="small text-muted">
                        Option: <strong className="text-dark">{b.deliveryOption === 'delivery' ? 'Site Delivery' : 'Direct Yard Pickup'}</strong>
                      </div>
                      <div className="fs-5 fw-bold text-primary mt-1">
                        ${b.totalAmount}
                        <span className="small text-muted fw-normal" style={{ fontSize: '0.75rem' }}> (incl. deposit)</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Daily: ${b.dailyRate}/day • Dep: ${b.securityDeposit}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-md-2 text-md-end d-flex flex-column gap-2">
                      <Link to={`/equipment/${b.equipment?._id}`} className="btn btn-sm btn-outline-secondary">
                        View Unit
                      </Link>

                      {/* Cancel button if pending/confirmed */}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}

                      {/* Review button if returned and not reviewed */}
                      {b.status === 'returned' && !b.hasReviewed && (
                        <button
                          type="button"
                          className="btn btn-sm btn-warning fw-bold text-dark"
                          onClick={() => {
                            setSelectedBookingForReview(b);
                            setShowReviewModal(true);
                          }}
                        >
                          <i className="bi bi-star-fill me-1"></i>Review
                        </button>
                      )}

                      {b.hasReviewed && (
                        <span className="badge bg-success-subtle text-success small py-1">
                          <i className="bi bi-check-all me-1"></i>Reviewed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline Dropdown preview */}
                  {b.statusTimeline?.length > 0 && (
                    <div className="mt-2 pt-2 border-top small text-muted d-flex align-items-center gap-2">
                      <i className="bi bi-clock-history text-secondary"></i>
                      <span>
                        Latest Update: <strong>{b.statusTimeline[b.statusTimeline.length - 1].notes}</strong> (
                        {new Date(b.statusTimeline[b.statusTimeline.length - 1].updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default CustomerDashboardPage;
