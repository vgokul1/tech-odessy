import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';

const EquipmentCard = ({ equipment, onBookClick }) => {
  const imageUrl =
    equipment.images && equipment.images.length > 0
      ? equipment.images[0]
      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card equipment-card h-100 shadow-sm border-0">
      <div className="equipment-card-img-wrapper">
        <img src={imageUrl} alt={equipment.title} loading="lazy" />
        <span className="badge-condition">
          <i className="bi bi-shield-check me-1"></i>
          {equipment.condition || 'Excellent'}
        </span>
        {equipment.featured && (
          <span className="badge-featured shadow-sm">
            <i className="bi bi-star-fill me-1"></i>Featured
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="badge bg-light text-secondary border">
            {equipment.category?.name || 'General Equipment'}
          </span>
          <RatingStars rating={equipment.rating} count={equipment.numReviews} />
        </div>

        <h6 className="card-title fw-bold text-dark mt-2 mb-1 text-truncate" title={equipment.title}>
          <Link
            to={`/equipment/${equipment._id}`}
            className="text-decoration-none text-dark hover-primary"
          >
            {equipment.title}
          </Link>
        </h6>

        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ minHeight: '38px' }}>
          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
          {equipment.location?.city ? `${equipment.location.city}, ${equipment.location.state}` : 'Austin, TX'}
          <span className="mx-2">•</span>
          <i className="bi bi-building text-primary me-1"></i>
          {equipment.owner?.companyName || equipment.owner?.name || 'Verified Partner'}
        </p>

        <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
          <div>
            <span className="text-muted small">From </span>
            <span className="fs-5 fw-bold text-dark">${equipment.dailyRate}</span>
            <span className="text-muted small"> /day</span>
          </div>

          <div className="d-flex gap-2">
            <Link
              to={`/equipment/${equipment._id}`}
              className="btn btn-sm btn-outline-secondary px-3"
            >
              Details
            </Link>
            {onBookClick ? (
              <button
                onClick={() => onBookClick(equipment)}
                className="btn btn-sm btn-primary px-3"
              >
                Rent Now
              </button>
            ) : (
              <Link
                to={`/equipment/${equipment._id}`}
                className="btn btn-sm btn-primary px-3"
              >
                Rent
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
