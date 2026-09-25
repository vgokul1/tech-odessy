import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 border-top border-secondary mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* Brand & Summary */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 fw-bold fs-4 mb-3">
              <span className="p-2 rounded bg-warning text-dark d-inline-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <i className="bi bi-gear-wide-connected fs-6"></i>
              </span>
              <span>Rental<span className="text-warning">Hub</span></span>
            </div>
            <p className="text-secondary small mb-3">
              The premier marketplace connecting construction contractors, landscapers, event organizers, and DIYers with verified equipment owners across North America.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <span className="cursor-pointer hover-white"><i className="bi bi-facebook fs-5"></i></span>
              <span className="cursor-pointer hover-white"><i className="bi bi-twitter-x fs-5"></i></span>
              <span className="cursor-pointer hover-white"><i className="bi bi-linkedin fs-5"></i></span>
              <span className="cursor-pointer hover-white"><i className="bi bi-instagram fs-5"></i></span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-warning fw-bold mb-3">Equipment</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li><Link to="/catalog?category=earthmoving" className="text-secondary text-decoration-none hover-white">Earthmoving</Link></li>
              <li><Link to="/catalog?category=aerial" className="text-secondary text-decoration-none hover-white">Aerial Lifts</Link></li>
              <li><Link to="/catalog?category=power-tools" className="text-secondary text-decoration-none hover-white">Power Tools</Link></li>
              <li><Link to="/catalog?category=audio" className="text-secondary text-decoration-none hover-white">Audio & Lighting</Link></li>
              <li><Link to="/catalog?category=generators" className="text-secondary text-decoration-none hover-white">Power Generators</Link></li>
            </ul>
          </div>

          {/* Platform Trust */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-warning fw-bold mb-3">Rental Protection</h6>
            <ul className="list-unstyled small text-secondary d-flex flex-column gap-2">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-6"></i>
                <span>$250,000 Equipment Coverage</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-patch-check text-info fs-6"></i>
                <span>100% Verified Fleet Owners</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-warning fs-6"></i>
                <span>Real-Time Double-Booking Prevention</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-credit-card-2-front text-light fs-6"></i>
                <span>Secure Escrow Payments</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-warning fw-bold mb-3">Support Desk</h6>
            <p className="small text-secondary mb-1">
              <i className="bi bi-geo-alt me-2 text-warning"></i>100 Congress Ave, Austin, TX 78701
            </p>
            <p className="small text-secondary mb-1">
              <i className="bi bi-telephone me-2 text-warning"></i>+1 (800) 555-RENT
            </p>
            <p className="small text-secondary mb-3">
              <i className="bi bi-envelope me-2 text-warning"></i>support@rentalhub.com
            </p>
            <div className="badge bg-secondary text-light p-2 w-100 text-center">
              24/7 Dispatch Hotline Active
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-wrap justify-content-between align-items-center small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} RentalHub Inc. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span className="hover-white cursor-pointer">Privacy Policy</span>
            <span className="hover-white cursor-pointer">Terms of Rental</span>
            <span className="hover-white cursor-pointer">Owner Liability Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
