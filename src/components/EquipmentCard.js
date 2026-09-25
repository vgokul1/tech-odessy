import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useCompare } from '../context/CompareContext';

const EquipmentCard = ({ equipment }) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const inCompare = isInCompare(equipment._id);

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(equipment._id);
    } else {
      addToCompare(equipment);
    }
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'New': return 'bg-success';
      case 'Like New': return 'bg-primary';
      case 'Good': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card h-100 card-hover shadow-sm border-0 position-relative">
      {/* Image Wrap */}
      <div className="equipment-card-img-wrap position-relative">
        <img
          src={equipment.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'}
          alt={equipment.title}
          className="equipment-card-img"
          loading="lazy"
        />
        {/* Badges on image */}
        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
          <span className={`badge ${getConditionColor(equipment.condition)} shadow-sm`}>
            {equipment.condition}
          </span>
          {equipment.isFeatured && (
            <span className="badge bg-warning text-dark shadow-sm">
              <i className="bi bi-lightning-fill me-1"></i> Featured
            </span>
          )}
        </div>

        {/* Compare Checkbox Button */}
        <div className="position-absolute top-0 end-0 m-2">
          <button
            type="button"
            className={`btn btn-sm rounded-circle p-1.5 shadow ${inCompare ? 'btn-primary' : 'btn-light'}`}
            style={{ width: '32px', height: '32px' }}
            onClick={handleCompareToggle}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <i className={`bi ${inCompare ? 'bi-check-lg' : 'bi-arrow-left-right'}`}></i>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-3">
        {/* Category & Location */}
        <div className="d-flex justify-content-between align-items-center mb-1.5">
          <span className="badge bg-light text-primary text-uppercase font-monospace" style={{ fontSize: '0.7rem' }}>
            {equipment.category?.name || 'General'}
          </span>
          <span className="text-muted small">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
            {equipment.location?.city || 'San Francisco'}
          </span>
        </div>

        {/* Title */}
        <h6 className="card-title fw-bold mb-2 text-truncate-2" style={{ lineHeight: '1.3', minHeight: '2.6rem' }}>
          <Link to={`/equipment/${equipment._id}`} className="text-decoration-none text-dark hover-primary">
            {equipment.title}
          </Link>
        </h6>

        {/* Star Rating */}
        <div className="mb-3">
          <StarRating rating={equipment.rating} numReviews={equipment.numReviews} />
        </div>

        {/* Pricing & CTA Button */}
        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="fs-5 fw-bold text-dark">${equipment.dailyRate}</span>
            <span className="text-muted small"> / day</span>
            {equipment.securityDeposit > 0 && (
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                Dep: ${equipment.securityDeposit}
              </div>
            )}
          </div>

          <Link
            to={`/equipment/${equipment._id}`}
            className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium"
          >
            Rent Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
