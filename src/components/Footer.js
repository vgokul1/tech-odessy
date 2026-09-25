import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-icon">
                <i className="bi bi-box-seam-fill"></i>
              </div>
              <span className="fs-4 fw-bold">Rental<span className="text-primary">Hub</span></span>
            </div>
            <p className="text-secondary small mb-3">
              RentalHub is an equipment rental marketplace connecting contractors, production studios, and equipment owners. Rent commercial tools, heavy machinery, and high-end gear safely with verified deposits and availability scheduling.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <a href="#github" className="text-secondary text-decoration-none fs-5"><i className="bi bi-github"></i></a>
              <a href="#twitter" className="text-secondary text-decoration-none fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#linkedin" className="text-secondary text-decoration-none fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          {/* Customer links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-uppercase fw-bold text-light mb-3 small tracking-wider">For Renters</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/equipment" className="text-secondary text-decoration-none">Browse Catalog</Link></li>
              <li className="mb-2"><Link to="/compare" className="text-secondary text-decoration-none">Compare Gear</Link></li>
              <li className="mb-2"><Link to="/equipment?category=heavy-machinery" className="text-secondary text-decoration-none">Heavy Machinery</Link></li>
              <li className="mb-2"><Link to="/equipment?category=cinema-photography" className="text-secondary text-decoration-none">Cinema Packages</Link></li>
              <li className="mb-2"><Link to="/dashboard" className="text-secondary text-decoration-none">Booking History</Link></li>
            </ul>
          </div>

          {/* Owner links */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-uppercase fw-bold text-light mb-3 small tracking-wider">For Equipment Owners</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/register?role=owner" className="text-secondary text-decoration-none">List Your Equipment</Link></li>
              <li className="mb-2"><Link to="/owner/dashboard" className="text-secondary text-decoration-none">Owner Portal</Link></li>
              <li className="mb-2"><Link to="/owner/bookings" className="text-secondary text-decoration-none">Manage Requests</Link></li>
              <li className="mb-2"><Link to="/owner/equipment" className="text-secondary text-decoration-none">Inventory & Holds</Link></li>
            </ul>
          </div>

          {/* Demo Credentials Quick Box */}
          <div className="col-lg-3 col-md-6">
            <div className="bg-black bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-50">
              <h6 className="text-primary fw-bold mb-2 small text-uppercase">
                <i className="bi bi-key-fill me-1"></i> Demo Credentials
              </h6>
              <ul className="list-unstyled mb-0" style={{ fontSize: '0.78rem' }}>
                <li className="mb-1 text-light">
                  <span className="text-secondary">Admin:</span> admin@rentalhub.com / admin123
                </li>
                <li className="mb-1 text-light">
                  <span className="text-secondary">Owner:</span> apexgear@rentalhub.com / owner123
                </li>
                <li className="text-light">
                  <span className="text-secondary">Customer:</span> john@example.com / customer123
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-50 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">&copy; {new Date().getFullYear()} RentalHub Marketplace, Inc. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span className="text-secondary">Double-Booking Collision Engine Protected</span>
            <span>•</span>
            <span className="text-secondary">MERN Production Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
