import React from 'react';

const RatingStars = ({ rating = 5, count = null, showScore = true }) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning me-1"></i>);
    } else if (i - 0.5 === rounded) {
      stars.push(<i key={i} className="bi bi-star-half text-warning me-1"></i>);
    } else {
      stars.push(<i key={i} className="bi bi-star text-muted opacity-50 me-1"></i>);
    }
  }

  return (
    <div className="d-inline-flex align-items-center">
      <div className="d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
        {stars}
      </div>
      {showScore && <span className="fw-bold ms-1 text-dark small">{rating?.toFixed(1) || '5.0'}</span>}
      {count !== null && <span className="text-muted ms-1 small">({count})</span>}
    </div>
  );
};

export default RatingStars;
