import React from 'react';

const StarRating = ({ rating = 0, numReviews, showText = true, interactive = false, onChange }) => {
  const handleClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="star-rating d-inline-flex">
        {[1, 2, 3, 4, 5].map((star) => {
          let starClass = 'bi bi-star';
          if (rating >= star) {
            starClass = 'bi bi-star-fill text-warning';
          } else if (rating >= star - 0.5) {
            starClass = 'bi bi-star-half text-warning';
          } else {
            starClass = 'bi bi-star text-muted';
          }

          return (
            <i
              key={star}
              className={`${starClass} ${interactive ? 'cursor-pointer me-1 fs-4' : 'small me-0.5'}`}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={() => handleClick(star)}
              title={interactive ? `${star} star${star > 1 ? 's' : ''}` : undefined}
            />
          );
        })}
      </div>

      {showText && !interactive && (
        <span className="small text-muted ms-1">
          <strong className="text-dark">{rating > 0 ? rating.toFixed(1) : 'New'}</strong>
          {numReviews !== undefined && (
            <span className="text-muted ms-1">({numReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
