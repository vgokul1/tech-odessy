import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center my-auto">
      <div className="card border-0 shadow-sm p-5 max-w-500 mx-auto">
        <div className="brand-icon bg-light text-primary mx-auto mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
          <i className="bi bi-geo-alt-fill"></i>
        </div>
        <h1 className="display-4 fw-extrabold text-primary mb-2">404</h1>
        <h4 className="fw-bold mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The page or equipment listing you are looking for has been moved, renamed, or no longer exists.
        </p>
        <div>
          <Link to="/" className="btn btn-primary rounded-pill px-4 fw-semibold">
            Return to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
