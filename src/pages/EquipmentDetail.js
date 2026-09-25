import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { equipmentAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import StarRating from '../components/StarRating';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Availability & Booking state
  const [bookedRanges, setBookedRanges] = useState([]);
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [conflictReason, setConflictReason] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ text: '', type: '' });

  // Calculate min start date (today formatted as YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchEquipmentData = useCallback(async () => {
    try {
      setLoading(true);
      const [equipRes, availRes, revRes] = await Promise.all([
        equipmentAPI.getById(id),
        equipmentAPI.getAvailability(id),
        reviewAPI.getForEquipment(id),
      ]);

      if (equipRes.data.success) {
        setEquipment(equipRes.data.data);
      }
      if (availRes.data.success) {
        setBookedRanges(availRes.data.bookedRanges || []);
        setBlockedRanges(availRes.data.blockedRanges || []);
      }
      if (revRes.data.success) {
        setReviews(revRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching equipment detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEquipmentData();
  }, [fetchEquipmentData]);

  // Check collision whenever startDate or endDate changes
  useEffect(() => {
    if (!startDate || !endDate) {
      setIsConflict(false);
      setConflictReason('');
      return;
    }

    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    if (reqStart >= reqEnd) {
      setIsConflict(true);
      setConflictReason('End date must be at least one day after start date');
      return;
    }

    // Check booked overlap
    const hasBookingConflict = bookedRanges.some((range) => {
      const bStart = new Date(range.startDate);
      const bEnd = new Date(range.endDate);
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (hasBookingConflict) {
      setIsConflict(true);
      setConflictReason('The selected dates overlap with an existing reservation.');
      return;
    }

    // Check blocked overlap
    const hasBlockedConflict = blockedRanges.some((range) => {
      const bStart = new Date(range.startDate);
      const bEnd = new Date(range.endDate);
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (hasBlockedConflict) {
      setIsConflict(true);
      setConflictReason('Selected dates conflict with owner maintenance blackout dates.');
      return;
    }

    setIsConflict(false);
    setConflictReason('');
  }, [startDate, endDate, bookedRanges, blockedRanges]);

  // Pricing calculations
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const rentalDays = calculateDuration();
  const rentSubtotal = rentalDays * (equipment?.dailyRate || 0);
  const securityDeposit = equipment?.securityDeposit || 0;
  const grandTotal = rentSubtotal + securityDeposit;

  // Handle Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingErrorMsg('');
    setBookingSuccessMsg('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
      return;
    }

    if (isConflict) return;

    try {
      setBookingSubmitting(true);
      const res = await bookingAPI.create({
        equipmentId: id,
        startDate,
        endDate,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : '',
        notes: bookingNotes,
      });

      if (res.data.success) {
        setBookingSuccessMsg('Booking request submitted successfully! Awaiting owner confirmation.');
        // Refresh availability
        const availRes = await equipmentAPI.getAvailability(id);
        if (availRes.data.success) {
          setBookedRanges(availRes.data.bookedRanges || []);
        }
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setBookingErrorMsg(err.response?.data?.message || 'Error creating booking. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg({ text: '', type: '' });

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await reviewAPI.create({
        equipmentId: id,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        setReviewMsg({ text: 'Review published successfully! Thank you.', type: 'success' });
        setNewComment('');
        // Refresh reviews & equipment rating
        const [revRes, equipRes] = await Promise.all([
          reviewAPI.getForEquipment(id),
          equipmentAPI.getById(id),
        ]);
        if (revRes.data.success) setReviews(revRes.data.data);
        if (equipRes.data.success) setEquipment(equipRes.data.data);
      }
    } catch (err) {
      setReviewMsg({
        text: err.response?.data?.message || 'Error submitting review. Note: You must have rented this equipment to review.',
        type: 'danger',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading equipment details...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          Equipment listing not found or has been removed.
        </div>
        <Link to="/equipment" className="btn btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const inCompare = isInCompare(equipment._id);

  return (
    <div className="container py-4">
      {/* Top Breadcrumb & Compare Action */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/equipment">Catalog</Link></li>
            <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>
              {equipment.title}
            </li>
          </ol>
        </nav>

        <button
          type="button"
          className={`btn btn-sm rounded-pill px-3 ${inCompare ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => inCompare ? removeFromCompare(equipment._id) : addToCompare(equipment)}
        >
          <i className={`bi ${inCompare ? 'bi-check-lg' : 'bi-arrow-left-right'} me-1`}></i>
          {inCompare ? 'In Compare List' : 'Compare Option'}
        </button>
      </div>

      <div className="row g-4 mb-5">
        {/* Left Column: Gallery & Details */}
        <div className="col-lg-8">
          {/* Main Gallery */}
          <div className="card border-0 shadow-sm overflow-hidden mb-4">
            <div style={{ height: '420px', backgroundColor: '#f1f5f9' }}>
              <img
                src={equipment.images?.[activeImageIndex] || equipment.images?.[0]}
                alt={equipment.title}
                className="w-100 h-100"
                style={{ objectFit: 'contain' }}
              />
            </div>
            {equipment.images?.length > 1 && (
              <div className="card-footer bg-white border-top p-2 d-flex gap-2 overflow-x-auto">
                {equipment.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className={`rounded border cursor-pointer ${activeImageIndex === idx ? 'border-primary border-3' : 'opacity-75'}`}
                    style={{ width: '70px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Heading, Condition & Rating */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary text-uppercase font-monospace">
                {equipment.category?.name}
              </span>
              <span className="badge bg-success-subtle text-success">
                Condition: {equipment.condition}
              </span>
              {equipment.isFeatured && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-lightning-fill"></i> Featured
                </span>
              )}
            </div>

            <h2 className="fw-bold mb-2">{equipment.title}</h2>

            <div className="d-flex align-items-center gap-3 text-muted small mb-3">
              <StarRating rating={equipment.rating} numReviews={equipment.numReviews} />
              <span>•</span>
              <span><i className="bi bi-geo-alt-fill text-danger me-1"></i>{equipment.location?.city}, {equipment.location?.state}</span>
            </div>

            <hr className="my-3 text-muted" />

            <h5 className="fw-bold mb-2">About This Equipment</h5>
            <p className="text-secondary" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {equipment.description}
            </p>
          </div>

          {/* Specifications Table */}
          {equipment.specifications && equipment.specifications.length > 0 && (
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Technical Specifications</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <tbody>
                    {equipment.specifications.map((spec, index) => (
                      <tr key={index}>
                        <td className="fw-semibold text-dark w-40" style={{ width: '35%' }}>{spec.key}</td>
                        <td className="text-secondary">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Owner Profile Card */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-light">
            <div className="d-flex align-items-center gap-3">
              <img
                src={equipment.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={equipment.owner?.name}
                className="rounded-circle shadow-sm"
                width="64"
                height="64"
                style={{ objectFit: 'cover' }}
              />
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="fw-bold mb-0 text-dark">{equipment.owner?.name}</h6>
                  <span className="badge bg-success-subtle text-success small">
                    <i className="bi bi-patch-check-fill me-1"></i> Verified Owner
                  </span>
                </div>
                {equipment.owner?.companyName && (
                  <div className="text-muted small fw-medium">{equipment.owner?.companyName}</div>
                )}
                <div className="text-muted small mt-1">
                  <i className="bi bi-telephone me-1"></i> {equipment.owner?.phone || 'Contact via platform'}
                </div>
              </div>
            </div>
          </div>

          {/* Booked / Reserved Calendar Schedule Summary */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-calendar3 me-2 text-primary"></i> Current Schedule & Reserved Dates
              </h5>
              <div className="availability-legend">
                <span><span className="legend-dot bg-danger"></span>Reserved</span>
                <span><span className="legend-dot bg-warning"></span>Maintenance Hold</span>
              </div>
            </div>

            {bookedRanges.length === 0 && blockedRanges.length === 0 ? (
              <div className="alert alert-success d-flex align-items-center mb-0">
                <i className="bi bi-check-circle-fill fs-5 me-2"></i>
                <div>This equipment is fully available with no current reservations or maintenance holds!</div>
              </div>
            ) : (
              <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                {bookedRanges.map((b) => (
                  <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center small py-2">
                    <div>
                      <span className="badge bg-danger-subtle text-danger me-2">Booked</span>
                      <strong>{new Date(b.startDate).toLocaleDateString()}</strong> to <strong>{new Date(b.endDate).toLocaleDateString()}</strong>
                    </div>
                    <span className="text-muted text-capitalize">Status: {b.status}</span>
                  </div>
                ))}
                {blockedRanges.map((b) => (
                  <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center small py-2 bg-light">
                    <div>
                      <span className="badge bg-warning-subtle text-warning-emphasis me-2">Hold</span>
                      <strong>{new Date(b.startDate).toLocaleDateString()}</strong> to <strong>{new Date(b.endDate).toLocaleDateString()}</strong>
                    </div>
                    <span className="text-muted fst-italic">{b.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
            {/* Rates Header */}
            <div className="d-flex justify-content-between align-items-baseline mb-3 pb-3 border-bottom">
              <div>
                <span className="fs-3 fw-extrabold text-primary">${equipment.dailyRate}</span>
                <span className="text-muted small"> / day</span>
              </div>
              {equipment.weeklyRate > 0 && (
                <div className="text-end">
                  <span className="fw-bold text-dark">${equipment.weeklyRate}</span>
                  <span className="text-muted small"> / week</span>
                </div>
              )}
            </div>

            {/* Booking Messages */}
            {bookingSuccessMsg && (
              <div className="alert alert-success small mb-3">
                <i className="bi bi-check-circle-fill me-1"></i> {bookingSuccessMsg}
              </div>
            )}
            {bookingErrorMsg && (
              <div className="alert alert-danger small mb-3">
                <i className="bi bi-exclamation-triangle-fill me-1"></i> {bookingErrorMsg}
              </div>
            )}

            {/* Date Conflict Alert */}
            {isConflict && (
              <div className="alert alert-danger d-flex align-items-start gap-2 small py-2 mb-3">
                <i className="bi bi-calendar-x-fill fs-5 text-danger flex-shrink-0"></i>
                <div>
                  <strong>Unavailable:</strong> {conflictReason}
                </div>
              </div>
            )}

            {/* Interactive Booking Form */}
            <form onSubmit={handleBookingSubmit}>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted mb-1">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted mb-1">End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Delivery Option */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted mb-1">Fulfillment Method</label>
                <select
                  className="form-select form-select-sm"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                >
                  <option value="pickup">Self Pickup at Owner Location (Free)</option>
                  <option value="delivery">Job-site Delivery &amp; Pickup</option>
                </select>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted mb-1">Delivery Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter full job site address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Special notes */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted mb-1">Rental Notes (Optional)</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  placeholder="Intended project use or pickup time..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Financial Calculation Breakdown */}
              {rentalDays > 0 && (
                <div className="bg-light p-3 rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-secondary">${equipment.dailyRate} × {rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                    <span className="fw-semibold text-dark">${rentSubtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-secondary">Security Deposit (Refundable)</span>
                    <span className="fw-semibold text-dark">${securityDeposit}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between fs-6 fw-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">${grandTotal}</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm"
                disabled={bookingSubmitting || isConflict || rentalDays === 0}
              >
                {bookingSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing Request...
                  </>
                ) : !isAuthenticated ? (
                  'Log In to Book Equipment'
                ) : isConflict ? (
                  'Dates Unavailable'
                ) : (
                  `Reserve for $${grandTotal > 0 ? grandTotal : equipment.dailyRate}`
                )}
              </button>
            </form>

            <div className="text-center mt-3 text-muted small" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-shield-lock-fill text-success me-1"></i>
              Zero double-booking guarantee. Free cancellation prior to owner confirmation.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-top pt-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Customer Reviews</h4>
                <div className="d-flex align-items-center gap-2">
                  <StarRating rating={equipment.rating} numReviews={equipment.numReviews} />
                  <span className="text-muted small">based on {reviews.length} verified ratings</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="card border-0 bg-light p-4 text-center text-muted mb-4">
                <i className="bi bi-chat-square-quote fs-2 mb-2 d-block text-secondary"></i>
                <p className="mb-0">No reviews yet for this equipment. Be the first renter to review!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 mb-5">
                {reviews.map((rev) => (
                  <div key={rev._id} className="card border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.customer?.name}
                          className="rounded-circle"
                          width="36"
                          height="36"
                        />
                        <div>
                          <div className="fw-bold small">{rev.customer?.name}</div>
                          <StarRating rating={rev.rating} showText={false} />
                        </div>
                      </div>
                      <span className="text-muted small">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-secondary small mb-0 ps-5" style={{ lineHeight: '1.6' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a Review Form */}
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3">Leave a Review</h5>

              {reviewMsg.text && (
                <div className={`alert alert-${reviewMsg.type} small mb-3`}>
                  {reviewMsg.text}
                </div>
              )}

              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted mb-1">Your Rating</label>
                    <div>
                      <StarRating
                        rating={newRating}
                        interactive={true}
                        onChange={(r) => setNewRating(r)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted mb-1">Your Feedback</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share details about the equipment condition, reliability, and owner communication..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    disabled={reviewSubmitting || !newComment.trim()}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="alert alert-light border small text-muted mb-0">
                  Please <Link to="/login" className="text-primary fw-semibold">log in</Link> to leave a review after completing your rental.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EquipmentDetail;
