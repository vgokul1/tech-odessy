import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import StarRating from '../components/StarRating';

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare, count } = useCompare();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="card border-0 shadow-sm p-5 max-w-600 mx-auto">
          <div className="category-icon-circle bg-primary-subtle text-primary mb-3 mx-auto">
            <i className="bi bi-arrow-left-right"></i>
          </div>
          <h4 className="fw-bold mb-2">No Equipment Selected For Comparison</h4>
          <p className="text-muted small mb-4">
            Select up to 4 equipment listings from our catalog to compare daily rates, specifications, condition, and security deposits side-by-side.
          </p>
          <div>
            <Link to="/equipment" className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold">
              Browse Equipment Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Aggregate all unique specification keys across selected items
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap((item) => (item.specifications || []).map((s) => s.key))
    )
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Side-by-Side Equipment Comparison</h2>
          <p className="text-muted small mb-0">
            Comparing <strong className="text-dark">{count}</strong> rental option{count > 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={clearCompare}
          >
            Clear All
          </button>
          <Link to="/equipment" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            + Add More
          </Link>
        </div>
      </div>

      <div className="table-responsive bg-white rounded-4 shadow-sm border p-3">
        <table className="table table-bordered align-middle text-center mb-0">
          <tbody>
            {/* Header Image & Title */}
            <tr>
              <th className="bg-light text-start" style={{ width: '200px' }}>Equipment</th>
              {compareItems.map((item) => (
                <td key={item._id} style={{ minWidth: '220px' }}>
                  <div className="position-relative mb-2">
                    <img
                      src={item.images?.[0]}
                      alt={item.title}
                      className="rounded-3 shadow-sm w-100"
                      style={{ height: '140px', objectFit: 'cover' }}
                    />
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1"
                      style={{ width: '26px', height: '26px', lineHeight: '1' }}
                      onClick={() => removeFromCompare(item._id)}
                      title="Remove from comparison"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                  <h6 className="fw-bold mb-1">
                    <Link to={`/equipment/${item._id}`} className="text-decoration-none text-dark hover-primary">
                      {item.title}
                    </Link>
                  </h6>
                  <span className="badge bg-primary-subtle text-primary text-uppercase font-monospace small">
                    {item.category?.name || 'General'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Daily Rate */}
            <tr>
              <th className="bg-light text-start">Daily Rental Rate</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <span className="fs-5 fw-bold text-primary">${item.dailyRate}</span>
                  <span className="text-muted small"> / day</span>
                </td>
              ))}
            </tr>

            {/* Weekly Rate */}
            <tr>
              <th className="bg-light text-start">Weekly Rate</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <span className="fw-semibold text-dark">
                    {item.weeklyRate ? `$${item.weeklyRate} / week` : 'Not specified'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Security Deposit */}
            <tr>
              <th className="bg-light text-start">Security Deposit</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <span className="fw-semibold text-dark">${item.securityDeposit || 0}</span>
                  <div className="text-muted small">Refundable</div>
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr>
              <th className="bg-light text-start">Condition</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <span className="badge bg-secondary-subtle text-dark px-3 py-1.5">
                    {item.condition}
                  </span>
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <th className="bg-light text-start">Rating &amp; Reviews</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <StarRating rating={item.rating} numReviews={item.numReviews} />
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <th className="bg-light text-start">Location</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {item.location?.city || 'San Francisco'}, {item.location?.state || 'CA'}
                </td>
              ))}
            </tr>

            {/* Technical Specifications Rows */}
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <th className="bg-light text-start text-secondary fw-normal">{key}</th>
                {compareItems.map((item) => {
                  const specObj = (item.specifications || []).find((s) => s.key === key);
                  return (
                    <td key={item._id} className="small text-secondary">
                      {specObj ? specObj.value : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Direct Booking CTA */}
            <tr>
              <th className="bg-light text-start">Action</th>
              {compareItems.map((item) => (
                <td key={item._id}>
                  <button
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold shadow-sm"
                    onClick={() => navigate(`/equipment/${item._id}`)}
                  >
                    Rent Now
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
