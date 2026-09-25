import React, { useState } from 'react';
import API from '../services/api';

const ReviewModal = ({ booking, show, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!show || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Please provide a review feedback comment.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await API.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment,
      });

      if (res.data.success) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-star-fill text-warning me-2"></i>
              Review Rental: {booking.equipment?.title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMessage && (
                <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>
              )}

              {/* Star selector */}
              <div className="text-center mb-4">
                <label className="form-label d-block text-muted small fw-bold mb-2">
                  Overall Rental Experience Rating
                </label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi ${
                        (hoverRating || rating) >= star
                          ? 'bi-star-fill text-warning'
                          : 'bi-star text-muted opacity-50'
                      } fs-2 cursor-pointer`}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    ></i>
                  ))}
                </div>
                <div className="text-muted small mt-1">
                  {rating === 5 && 'Outstanding - Flawless equipment & service!'}
                  {rating === 4 && 'Very Good - Met all project needs.'}
                  {rating === 3 && 'Average - Handled the job with minor caveats.'}
                  {rating === 2 && 'Below Expectation - Issues encountered.'}
                  {rating === 1 && 'Poor - Unacceptable condition.'}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Detailed Review Feedback</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share details on equipment performance, ease of pickup/return, fuel efficiency, and owner communication..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-warning fw-bold px-4">
                {submitting ? 'Submitting...' : 'Post Public Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
