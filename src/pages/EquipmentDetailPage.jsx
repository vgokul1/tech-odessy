import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import RatingStars from '../components/RatingStars';
import BookingModal from '../components/BookingModal';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/equipment/${id}`);
        if (res.data.success) {
          setEquipment(res.data.equipment);
          setBookedDates(res.data.bookedDates || []);
          setActiveImage(res.data.equipment.images?.[0] || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Equipment listing not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading equipment specifications...</div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning py-4">
          <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 text-warning d-block"></i>
          <h4 className="fw-bold">Listing Unavailable</h4>
          <p className="text-muted">{error || 'This listing does not exist.'}</p>
          <Link to="/catalog" className="btn btn-primary fw-bold mt-2">
            Back to Equipment Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 bg-light">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/catalog" className="text-decoration-none">Catalog</Link></li>
            <li className="breadcrumb-item"><Link to={`/catalog?category=${equipment.category?.slug}`} className="text-decoration-none">{equipment.category?.name}</Link></li>
            <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>{equipment.title}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Main Left Details */}
          <div className="col-lg-8">
            {/* Gallery */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4">
              <div style={{ height: '420px', backgroundColor: '#e2e8f0' }} className="position-relative">
                <img
                  src={activeImage}
                  alt={equipment.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge-condition">
                  <i className="bi bi-shield-check me-1"></i>Condition: {equipment.condition}
                </span>
                {equipment.featured && (
                  <span className="badge-featured">
                    <i className="bi bi-star-fill me-1"></i>Featured Fleet
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {equipment.images?.length > 1 && (
                <div className="card-body p-3 bg-white border-top d-flex gap-2 overflow-auto">
                  {equipment.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Thumbnail"
                      onClick={() => setActiveImage(img)}
                      className={`rounded cursor-pointer border ${activeImage === img ? 'border-primary border-3' : 'opacity-75'}`}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <span className="badge bg-light text-primary border">
                  <i className={`bi ${equipment.category?.icon || 'bi-tools'} me-1`}></i>
                  {equipment.category?.name}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <RatingStars rating={equipment.rating} count={equipment.numReviews} />
                  <span className="text-muted small">• {equipment.totalRentals || 0} Successful Rentals</span>
                </div>
              </div>

              <h2 className="fw-bold text-dark mb-2">{equipment.title}</h2>
              <div className="text-muted small mb-3">
                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                {equipment.location?.address ? `${equipment.location.address}, ` : ''}
                {equipment.location?.city}, {equipment.location?.state} {equipment.location?.zipCode}
              </div>

              <h5 className="fw-bold text-dark mt-3 mb-2">Equipment Description</h5>
              <p className="text-secondary" style={{ lineHeight: 1.7 }}>
                {equipment.description}
              </p>

              {/* Technical Specifications Sheet */}
              <h5 className="fw-bold text-dark mt-4 mb-3">Technical Specifications</h5>
              <div className="row g-2">
                {equipment.specs?.map((spec, index) => (
                  <div key={index} className="col-sm-6">
                    <div className="p-2 bg-light rounded border d-flex justify-content-between small">
                      <span className="text-muted">{spec.key}:</span>
                      <strong className="text-dark">{spec.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Booked Dates Notice */}
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-2">
                <i className="bi bi-calendar2-range me-2 text-primary"></i>
                Current Fleet Availability
              </h5>
              <p className="text-muted small mb-3">
                RentalHub guarantees zero overlapping bookings. Confirmed reserved windows are automatically protected on the schedule.
              </p>

              {bookedDates.length === 0 ? (
                <div className="alert alert-success py-2 small mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <div>This equipment has open availability for immediate booking reservations!</div>
                </div>
              ) : (
                <div>
                  <span className="small text-muted fw-bold d-block mb-2">Currently Reserved Windows:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {bookedDates.map((b, i) => (
                      <span key={i} className="badge bg-secondary text-light py-2 px-3">
                        <i className="bi bi-lock-fill me-1 text-warning"></i>
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">Verified Customer Reviews</h5>
                <RatingStars rating={equipment.rating} count={equipment.numReviews} />
              </div>

              {equipment.reviews?.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No public reviews for this unit yet. Be the first to rent and share feedback!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {equipment.reviews.map((rev) => (
                    <div key={rev._id} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={rev.customer?.name}
                            className="rounded-circle"
                            width="36"
                            height="36"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold small text-dark">{rev.customer?.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} showScore={false} />
                      </div>

                      <p className="text-secondary small mb-2">{rev.comment}</p>

                      {/* Owner response if available */}
                      {rev.ownerResponse?.comment && (
                        <div className="p-2 bg-white rounded border-start border-3 border-primary ms-3 mt-2 small">
                          <div className="fw-bold text-primary" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-reply-fill me-1"></i>Response from Fleet Owner:
                          </div>
                          <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                            {rev.ownerResponse.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 p-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-baseline mb-3 pb-3 border-bottom">
                <div>
                  <span className="fs-2 fw-bold text-dark">${equipment.dailyRate}</span>
                  <span className="text-muted small"> /day</span>
                </div>
                {equipment.hourlyRate > 0 && (
                  <div className="text-muted small">
                    or ${equipment.hourlyRate}/hour
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Refundable Security Deposit:</span>
                  <strong className="text-dark">${equipment.securityDeposit}</strong>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Platform Protection Fee:</span>
                  <strong className="text-dark">$15.00</strong>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Available Delivery:</span>
                  <strong className="text-success">Job-Site or Yard Pickup</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="btn btn-warning w-100 py-3 fw-bold fs-6 shadow-sm mb-3"
              >
                <i className="bi bi-calendar-check-fill me-2"></i>
                Select Dates & Book Machine
              </button>

              <div className="p-3 bg-light rounded-3 border small mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                  <i className="bi bi-shield-check fs-5"></i>
                  <span>RentalHub Guarantee</span>
                </div>
                <ul className="list-unstyled mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                  <li>✓ Machine inspected before dispatch</li>
                  <li>✓ Zero double-booking assurance</li>
                  <li>✓ Deposit held securely in platform escrow</li>
                </ul>
              </div>

              {/* Owner Information Card */}
              <div className="border-top pt-3">
                <h6 className="fw-bold small text-muted mb-3">LISTED BY FLEET OWNER</h6>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={equipment.owner?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'}
                    alt={equipment.owner?.name}
                    className="rounded-circle border"
                    width="48"
                    height="48"
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-bold text-dark">{equipment.owner?.companyName || equipment.owner?.name}</div>
                    <div className="text-muted small">
                      <i className="bi bi-patch-check-fill text-primary me-1"></i>Verified Business
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-muted small">
                  <i className="bi bi-telephone-fill me-1 text-secondary"></i>
                  {equipment.owner?.phone || '+1 (512) 555-RENT'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingModal
        equipment={equipment}
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
};

export default EquipmentDetailPage;
