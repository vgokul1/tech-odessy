import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ equipment, show, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getTomorrow = (daysAhead = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTomorrow(1));
  const [endDate, setEndDate] = useState(getTomorrow(3));
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflictReason, setConflictReason] = useState('');
  const [pricing, setPricing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check availability whenever dates change
  useEffect(() => {
    if (!show || !equipment || !startDate || !endDate) return;

    const checkAvailability = async () => {
      setChecking(true);
      setErrorMessage('');
      try {
        const res = await API.post(`/equipment/${equipment._id}/check-availability`, {
          startDate,
          endDate,
        });

        if (res.data.success) {
          setIsAvailable(res.data.isAvailable);
          setConflictReason(res.data.reason || '');
          if (res.data.calculation) {
            setPricing(res.data.calculation);
          }
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Could not verify dates.');
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [equipment, startDate, endDate, show]);

  if (!show || !equipment) return null;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=catalog');
      return;
    }

    if (!isAvailable) return;

    try {
      setSubmitting(true);
      setErrorMessage('');

      const payload = {
        equipmentId: equipment._id,
        startDate,
        endDate,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : '',
        customerNotes,
      };

      const res = await API.post('/bookings', payload);
      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.booking);
        onClose();
        navigate('/dashboard/customer');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit booking reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-dark text-white border-bottom border-secondary">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-calendar-check text-warning"></i>
              Reserve Equipment: {equipment.title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmitBooking}>
            <div className="modal-body p-4">
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <div>{errorMessage}</div>
                </div>
              )}

              <div className="row g-3">
                {/* Equipment summary pill */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 border">
                    <img
                      src={equipment.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={equipment.title}
                      className="rounded"
                      style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark">{equipment.title}</div>
                      <div className="small text-muted">
                        Owner: {equipment.owner?.companyName || equipment.owner?.name} • Location: {equipment.location?.city}, {equipment.location?.state}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold fs-5 text-primary">${equipment.dailyRate}</div>
                      <div className="small text-muted">per 24-hr day</div>
                    </div>
                  </div>
                </div>

                {/* Rental Dates */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">
                    <i className="bi bi-calendar-event me-1 text-primary"></i>Pick-up / Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">
                    <i className="bi bi-calendar-event-fill me-1 text-primary"></i>Return / End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                {/* Real-time Availability status indicator */}
                <div className="col-12">
                  {checking ? (
                    <div className="text-muted small d-flex align-items-center gap-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      Checking fleet schedule & conflict prevention engine...
                    </div>
                  ) : !isAvailable ? (
                    <div className="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-0">
                      <i className="bi bi-calendar-x fs-5 text-danger"></i>
                      <div>
                        <strong>Unavailable for requested dates:</strong> {conflictReason}
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-0">
                      <i className="bi bi-check-circle-fill fs-5 text-success"></i>
                      <div>
                        <strong>Dates Available!</strong> Equipment is ready for reservation.
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Options */}
                <div className="col-12">
                  <label className="form-label fw-bold small">Fulfillment Preference</label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deliveryOption"
                        id="optPickup"
                        value="pickup"
                        checked={deliveryOption === 'pickup'}
                        onChange={() => setDeliveryOption('pickup')}
                      />
                      <label className="form-check-label small" htmlFor="optPickup">
                        <i className="bi bi-box-seam me-1"></i>Direct Yard Pickup (Free)
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deliveryOption"
                        id="optDelivery"
                        value="delivery"
                        checked={deliveryOption === 'delivery'}
                        onChange={() => setDeliveryOption('delivery')}
                      />
                      <label className="form-check-label small" htmlFor="optDelivery">
                        <i className="bi bi-truck me-1"></i>Job-Site Delivery
                      </label>
                    </div>
                  </div>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="col-12">
                    <label className="form-label small fw-bold">Job-Site Delivery Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street address, city, gate instructions"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required={deliveryOption === 'delivery'}
                    />
                  </div>
                )}

                {/* Customer Notes */}
                <div className="col-12">
                  <label className="form-label small fw-bold">Notes / Requirements for Owner</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Project scope, operator requirements, preferred pickup window..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Pricing Breakdown Sheet */}
                {pricing && isAvailable && (
                  <div className="col-12">
                    <div className="border rounded-3 p-3 bg-light">
                      <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Estimated Price Breakdown</h6>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>${pricing.dailyRate} × {pricing.rentalDays} Day(s)</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-1 text-muted">
                        <span>Refundable Security Deposit</span>
                        <span>${pricing.securityDeposit.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-2 text-muted">
                        <span>Platform Protection & Service Fee</span>
                        <span>${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold fs-6 pt-2 border-top text-dark">
                        <span>Total Estimated Due</span>
                        <span className="text-primary">${pricing.total.toFixed(2)}</span>
                      </div>
                      <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                        *Security deposit is returned within 48h following undamaged equipment return inspection.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isAvailable || checking || submitting}
                className="btn btn-primary px-4 fw-bold"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-1"></i>
                    Confirm Reservation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
