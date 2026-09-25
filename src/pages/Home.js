import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryAPI, equipmentAPI } from '../services/api';
import EquipmentCard from '../components/EquipmentCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, equipRes] = await Promise.all([
          categoryAPI.getAll(),
          equipmentAPI.getAll({ featured: 'true', limit: 6 }),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
        if (equipRes.data.success) {
          setFeaturedEquipment(equipRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedCity.trim()) params.append('city', selectedCity.trim());

    navigate(`/equipment?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5 py-lg-6 position-relative text-white">
        <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
        <div className="container position-relative py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-25 text-primary-emphasis border border-primary border-opacity-50 px-3 py-2 rounded-pill mb-3 small fw-semibold">
                <i className="bi bi-shield-check me-1 text-primary"></i> Trusted Equipment Rental Marketplace
              </span>
              <h1 className="display-4 fw-extrabold mb-3 text-white tracking-tight" style={{ lineHeight: '1.15' }}>
                Rent Pro-Grade Equipment <br />
                <span className="text-primary">Without The Overhead.</span>
              </h1>
              <p className="lead text-light text-opacity-75 mb-4 pe-lg-4">
                Access heavy machinery, high-end cinema kits, power tools, and event audio from verified local owners with automated availability and zero booking conflicts.
              </p>

              {/* Quick Search Widget */}
              <div className="bg-white p-3 rounded-4 shadow-lg text-dark">
                <form onSubmit={handleHeroSearch} className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted mb-1">Looking for...</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Excavator, Sony FX6..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted mb-1">Category</label>
                    <select
                      className="form-select form-select-sm border-0 bg-light"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted mb-1">City / Location</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-geo-alt text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="e.g. San Francisco"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary btn-sm w-100 py-2 fw-semibold rounded-3">
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Trust Highlights */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-2 text-light text-opacity-75 small">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-calendar2-check-fill text-success fs-5"></i>
                  <span>Double-Booking Protection</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-patch-check-fill text-primary fs-5"></i>
                  <span>Verified Owners & Gear</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock-fill text-warning fs-5"></i>
                  <span>Secure Deposits</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80"
                  alt="Industrial Machinery"
                  className="rounded-4 shadow-lg w-100 border border-secondary border-opacity-25"
                  style={{ objectFit: 'cover', height: '420px' }}
                />
                <div className="position-absolute bottom-0 start-0 translate-middle-y bg-dark bg-opacity-90 backdrop-blur p-3 rounded-3 shadow border border-secondary ms-4 text-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary p-2 rounded text-white">
                      <i className="bi bi-lightning-charge-fill fs-4"></i>
                    </div>
                    <div>
                      <div className="fw-bold small">Instant Availability Check</div>
                      <div className="text-secondary small">Real-time schedule conflict engine</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Browse by Specialty</span>
              <h2 className="fw-bold mb-0">Equipment Categories</h2>
            </div>
            <Link to="/equipment" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat._id} className="col-lg-2 col-md-4 col-6">
                <Link to={`/equipment?category=${cat.slug}`} className="category-box">
                  <div className="category-icon-circle">
                    <i className={`bi ${cat.icon || 'bi-box-seam'}`}></i>
                  </div>
                  <h6 className="fw-bold mb-1 text-truncate" title={cat.name}>{cat.name}</h6>
                  <span className="badge bg-light text-secondary small">
                    {cat.equipmentCount || 0} listings
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Equipment Grid */}
      <section className="py-5 bg-subtle">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Top Rated & Verified</span>
              <h2 className="fw-bold mb-0">Featured Equipment for Rent</h2>
            </div>
            <Link to="/equipment?featured=true" className="btn btn-link text-primary text-decoration-none fw-semibold">
              Explore Featured <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredEquipment.map((eq) => (
                <div key={eq._id} className="col-lg-4 col-md-6">
                  <EquipmentCard equipment={eq} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How RentalHub Works */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Effortless Workflow</span>
            <h2 className="fw-bold mb-2">How RentalHub Works</h2>
            <p className="text-muted">A modern, dependable rental experience designed for both contractors and equipment owners.</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-subtle h-100">
                <div className="category-icon-circle bg-primary-subtle text-primary mb-3">
                  <i className="bi bi-search"></i>
                </div>
                <h5 className="fw-bold mb-2">1. Browse & Check Dates</h5>
                <p className="text-muted small mb-0">
                  Search equipment by category, location, or price. Compare options side-by-side and select your needed rental dates.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-subtle h-100">
                <div className="category-icon-circle bg-warning-subtle text-warning mb-3">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <h5 className="fw-bold mb-2">2. Reserve with Zero Conflict</h5>
                <p className="text-muted small mb-0">
                  Our anti-collision calendar prevents double-bookings. Submit your rental request and receive instant owner confirmation.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-subtle h-100">
                <div className="category-icon-circle bg-success-subtle text-success mb-3">
                  <i className="bi bi-truck"></i>
                </div>
                <h5 className="fw-bold mb-2">3. Pickup, Work & Return</h5>
                <p className="text-muted small mb-0">
                  Coordinate pickup or job-site delivery. Complete your project, return the gear safely, and release your deposit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Call-To-Action Banner */}
      <section className="py-5 bg-dark text-white position-relative">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-primary mb-2">For Equipment Owners & Businesses</span>
              <h2 className="fw-bold text-white mb-2">Have Machinery or High-End Gear Sitting Idle?</h2>
              <p className="text-light text-opacity-75 mb-0">
                Monetize your inventory on RentalHub. List your tools, set your own rates and security deposits, manage calendar blackouts, and accept bookings with complete transparency.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/register?role=owner" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow">
                Start Listing Equipment <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
