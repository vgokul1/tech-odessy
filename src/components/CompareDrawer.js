import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

const CompareDrawer = () => {
  const { compareItems, removeFromCompare, clearCompare, count } = useCompare();
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <div className="compare-floating-bar d-flex flex-wrap align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold small text-uppercase tracking-wider">
          <i className="bi bi-arrow-left-right text-primary me-2"></i>
          Compare ({count}/4):
        </span>
        <div className="d-flex gap-2 align-items-center">
          {compareItems.map((item) => (
            <div key={item._id} className="position-relative d-inline-block">
              <img
                src={item.images?.[0]}
                alt={item.title}
                className="rounded border border-secondary"
                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                title={item.title}
              />
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"
                style={{ width: '8px', height: '8px' }}
                onClick={() => removeFromCompare(item._id)}
                title="Remove"
              ></button>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2 align-items-center ms-auto">
        <button
          className="btn btn-outline-light btn-sm rounded-pill px-3 py-1"
          style={{ fontSize: '0.8rem' }}
          onClick={clearCompare}
        >
          Clear
        </button>
        <button
          className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-semibold shadow"
          style={{ fontSize: '0.8rem' }}
          onClick={() => navigate('/compare')}
        >
          Compare Now <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};

export default CompareDrawer;
