import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import EquipmentCard from '../components/EquipmentCard';
import BookingModal from '../components/BookingModal';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Booking Modal State
  const [bookingEquipment, setBookingEquipment] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, eqRes] = await Promise.all([
          API.get('/categories'),
          API.get('/equipment?featured=true&limit=6'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (eqRes.data.success) {
          setFeaturedEquipment(eqRes.data.equipment);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/catalog?${params.toString()}`);
  };

  const handleBookClick = (equipment) => {
    setBookingEquipment(equipment);
    setShowBookingModal(true);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                <i className="bi bi-shield-check me-1"></i> #1 Trusted Equipment Rental Marketplace
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ lineHeight: 1.15 }}>
                Rent Heavy Machinery & Pro Tools On Demand
              </h1>
              <p className="lead text-light opacity-90 mb-4" style={{ maxWidth: '580px' }}>
                Connect directly with certified equipment owners. Book excavators, scissor lifts, generators, and commercial gear with guaranteed availability and transparent daily pricing.
              </p>

              {/* Quick Search Widget */}
              <div className="hero-search-box">
                <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Excavator, boom lift, QSC sound..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="">Any City</option>
                      <option value="Austin">Austin, TX</option>
                      <option value="Dallas">Dallas, TX</option>
                      <option value="Houston">Houston, TX</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <button type="submit" className="btn btn-warning w-100 fw-bold py-2">
                      Find Fleet
                    </button>
                  </div>
                </form>
              </div>

              {/* Trust Counters */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-2 text-white">
                <div>
                  <div className="fs-5 fw-bold text-warning">2,400+</div>
                  <div className="small text-light opacity-75">Machinery Units</div>
                </div>
                <div className="vr bg-secondary opacity-50"></div>
                <div>
                  <div className="fs-5 fw-bold text-warning">99.8%</div>
                  <div className="small text-light opacity-75">On-Time Dispatch</div>
                </div>
                <div className="vr bg-secondary opacity-50"></div>
                <div>
                  <div className="fs-5 fw-bold text-warning">$0 Deposit</div>
                  <div className="small text-light opacity-75">With Verified ID</div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80"
                  alt="Heavy Excavator Rental"
                  className="img-fluid rounded-4 shadow-lg border border-secondary"
                  style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
                />
                <div className="card position-absolute bottom-0 start-0 m-3 p-3 bg-white text-dark shadow rounded-3 border-0" style={{ maxWidth: '240px' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-patch-check-fill text-primary fs-5"></i>
                    <span className="fw-bold small">Instant Reservation</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Zero double-booking guarantee with automatic fleet scheduling.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Industrial Categories</span>
              <h3 className="fw-bold text-dark mt-1">Browse by Equipment Category</h3>
            </div>
            <Link to="/catalog" className="btn btn-outline-primary btn-sm fw-bold">
              View All Categories <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat._id} className="col-lg-4 col-md-6">
                <Link
                  to={`/catalog?category=${cat.slug}`}
                  className="card text-decoration-none border h-100 p-3 hover-shadow rounded-3 transition-all"
                  style={{ background: '#f8fafc' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-3 bg-white text-primary border shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: '56px', height: '56px' }}
                    >
                      <i className={`bi ${cat.icon || 'bi-tools'} fs-4`}></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                      <span className="badge bg-secondary text-light small">
                        {cat.equipmentCount || 0} Listed Items
                      </span>
                    </div>
                  </div>
                  <p className="text-muted small mt-2 mb-0 text-truncate">
                    {cat.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Equipment Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-warning fw-bold text-uppercase small">Verified Fleet</span>
              <h3 className="fw-bold text-dark mt-1">Featured Equipment Available Today</h3>
            </div>
            <Link to="/catalog" className="btn btn-primary btn-sm fw-bold">
              Explore All Listings <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted">Loading equipment fleet...</div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredEquipment.map((eq) => (
                <div key={eq._id} className="col-lg-4 col-md-6">
                  <EquipmentCard equipment={eq} onBookClick={handleBookClick} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Simple 4-Step Process</span>
            <h2 className="fw-bold text-dark mt-1">How RentalHub Works</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '550px' }}>
              We simplified industrial machinery rentals. No endless phone calls, transparent quotes, and verified equipment ready for work.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-light border border-2 border-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-search fs-3"></i>
                </div>
                <h5 className="fw-bold">1. Find Equipment</h5>
                <p className="text-muted small">
                  Filter by category, horsepower, dig depth, location, and real-time date availability.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-light border border-2 border-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-calendar2-check fs-3"></i>
                </div>
                <h5 className="fw-bold">2. Select Dates & Reserve</h5>
                <p className="text-muted small">
                  Conflict-free booking engine guarantees the machine is locked for your exact project window.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-light border border-2 border-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-truck fs-3"></i>
                </div>
                <h5 className="fw-bold">3. Pickup or Jobsite Delivery</h5>
                <p className="text-muted small">
                  Choose self-haul from the owner's yard or opt for heavy tilt-tray delivery directly to site.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-light border border-2 border-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-star-fill text-warning fs-3"></i>
                </div>
                <h5 className="fw-bold">4. Return & Review</h5>
                <p className="text-muted small">
                  Quick check-in inspection, instant security deposit refund, and verified community rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Partnership CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-warning text-dark fw-bold mb-2">Fleet Owners & Rental Companies</span>
              <h2 className="fw-bold text-white mb-2">Turn Idle Machinery Into Predictable Monthly Revenue</h2>
              <p className="text-light opacity-75 mb-0" style={{ maxWidth: '640px' }}>
                Join hundreds of rental yards, contractors, and production houses listing equipment on RentalHub. We provide full damage protection, automated date scheduling, and guaranteed payouts.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/register?role=owner" className="btn btn-warning btn-lg fw-bold px-4 py-3 shadow">
                <i className="bi bi-plus-circle me-2"></i>List Your Equipment Fleet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingEquipment && (
        <BookingModal
          equipment={bookingEquipment}
          show={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
