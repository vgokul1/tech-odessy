import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import StarRating from '../../components/StarRating';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Cancel action state
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getCustomerBookings({
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Cancel Booking
  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    try {
      setCancelLoading(true);
      const res = await bookingAPI.cancel(cancellingBookingId, { reason: cancelReason });
      if (res.data.success) {
        setAlertMsg({ text: 'Booking reservation was cancelled.', type: 'info' });
        setCancellingBookingId(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error cancelling booking', type: 'danger' });
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      setReviewLoading(true);
      const res = await reviewAPI.create({
        equipmentId: reviewBooking.equipment._id,
        bookingId: reviewBooking._id,
        rating,
        comment,
      });
      if (res.data.success) {
        setAlertMsg({ text: 'Thank you! Your review has been published.', type: 'success' });
        setReviewBooking(null);
        setComment('');
        setRating(5);
        fetchBookings();
      }
    } catch (err) {
      setAlertMsg({ text: err.response?.data?.message || 'Error submitting review', type: 'danger' });
    } finally {
      setReviewLoading(false);
    }
  };

  // Stats
  const activeCount = bookings.filter((b) => b.status === 'active').length;
  const returnedCount = bookings.filter((b) => b.status === 'returned').length;

  return (
    <div className="container py-4">
      {/* Profile Header */}
      <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="rounded-circle shadow-sm"
              width="64"
              height="64"
              style={{ objectFit: 'cover' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold mb-0">{user?.name}</h4>
                <span className="badge badge-role-customer text-capitalize">Customer Account</span>
              </div>
              <div className="text-muted small">{user?.email} • {user?.phone || 'No phone set'}</div>
            </div>
          </div>
          <div>
            <Link to="/equipment" className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-search me-1"></i> Browse More Equipment
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="metric-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold text-uppercase">Total Bookings</div>
              <h3 className="fw-extrabold mb-0">{bookings.length}</h3>
            </div>
            <div className="metric-icon-wrap bg-primary-subtle text-primary">
              <i className="bi bi-calendar-check"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold text-uppercase">Active Rentals</div>
              <h3 className="fw-extrabold mb-0 text-success">{activeCount}</h3>
            </div>
            <div className="metric-icon-wrap bg-success-subtle text-success">
              <i className="bi bi-arrow-repeat"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold text-uppercase">Completed Rentals</div>
              <h3 className="fw-extrabold mb-0">{returnedCount}</h3>
            </div>
            <div className="metric-icon-wrap bg-secondary-subtle text-secondary">
              <i className="bi bi-check2-all"></i>
            </div>
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

      {/* Bookings Section */}
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h5 className="fw-bold mb-0">Rental History &amp; Bookings</h5>
            <span className="text-muted small">Track your equipment reservations, return status, and receipts</span>
          </div>

          {/* Filter Status Pills */}
          <div className="btn-group btn-group-sm" role="group">
            {['all', 'pending', 'confirmed', 'active', 'returned', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn text-capitalize ${filterStatus === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 border rounded-3 bg-light p-4">
            <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
            <h6>No Bookings Found</h6>
            <p className="text-muted small mb-3">You don't have any bookings matching this status filter.</p>
            <Link to="/equipment" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              Explore Equipment Catalog
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {bookings.map((b) => (
              <div key={b._id} className="card border shadow-sm p-3 p-md-4 rounded-3">
                <div className="row g-3 align-items-center">
                  {/* Equipment Thumbnail */}
                  <div className="col-md-2 col-4">
                    <img
                      src={b.equipment?.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=300&q=80'}
                      alt={b.equipment?.title}
                      className="rounded-3 w-100 shadow-sm"
                      style={{ height: '90px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Title & Dates */}
                  <div className="col-md-4 col-8">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <StatusBadge status={b.status} />
                      <span className="text-muted small font-monospace">#{b._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h6 className="fw-bold mb-1">
                      <Link to={`/equipment/${b.equipment?._id}`} className="text-decoration-none text-dark hover-primary">
                        {b.equipment?.title || 'Equipment listing'}
                      </Link>
                    </h6>
                    <div className="text-muted small">
                      <i className="bi bi-calendar-event me-1 text-primary"></i>
                      {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()} ({b.totalDays} days)
                    </div>
                  </div>

                  {/* Pricing Breakdown & Owner */}
                  <div className="col-md-3 col-6">
                    <div className="fw-bold text-dark fs-6">${b.totalAmount}</div>
                    <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                      Rent: ${b.rentAmount} + Dep: ${b.securityDeposit}
                    </div>
                    <div className="text-secondary small mt-1">
                      <i className="bi bi-building me-1"></i>
                      {b.owner?.companyName || b.owner?.name}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-md-3 col-6 text-md-end">
                    <div className="d-flex flex-column gap-1">
                      {/* Cancel action if pending or confirmed */}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setCancellingBookingId(b._id)}
                        >
                          Cancel Booking
                        </button>
                      )}

                      {/* Review action if returned */}
                      {b.status === 'returned' && (
                        <button
                          className="btn btn-outline-success btn-sm rounded-pill py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setReviewBooking(b)}
                        >
                          <i className="bi bi-star-fill text-warning me-1"></i> Review Gear
                        </button>
                      )}

                      <Link
                        to={`/equipment/${b.equipment?._id}`}
                        className="btn btn-light btn-sm rounded-pill py-1 text-primary border"
                        style={{ fontSize: '0.78rem' }}
                      >
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingBookingId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Cancel Booking</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancellingBookingId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Are you sure you want to cancel this equipment booking? Any deposit hold will be released.
                </p>
                <label className="form-label small fw-bold">Reason for cancellation (optional):</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Project rescheduled or change of plans..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-3"
                  onClick={() => setCancellingBookingId(null)}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm rounded-pill px-4 fw-semibold"
                  disabled={cancelLoading}
                  onClick={handleCancelBooking}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Review {reviewBooking.equipment?.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewBooking(null)}
                ></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body">
                  <div className="mb-3 text-center">
                    <label className="form-label small fw-bold text-muted d-block mb-1">Your Rating</label>
                    <StarRating
                      rating={rating}
                      interactive={true}
                      onChange={(r) => setRating(r)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Feedback Comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="How was the equipment condition and owner service?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-pill px-3"
                    onClick={() => setReviewBooking(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
                    disabled={reviewLoading || !comment.trim()}
                  >
                    {reviewLoading ? 'Posting...' : 'Submit Review'}
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

export default CustomerDashboard;
