import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import EquipmentCard from '../components/EquipmentCard';
import BookingModal from '../components/BookingModal';

const EquipmentCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data State
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingEquipment, setBookingEquipment] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch equipment whenever filters change
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (condition) params.append('condition', condition);
        if (city) params.append('city', city);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);
        params.append('page', page);
        params.append('limit', 9);

        // Sync with browser URL
        setSearchParams(params, { replace: true });

        const res = await API.get(`/equipment?${params.toString()}`);
        if (res.data.success) {
          setEquipmentList(res.data.equipment);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching equipment listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [search, category, condition, city, minPrice, maxPrice, sort, page]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  const handleBookClick = (eq) => {
    setBookingEquipment(eq);
    setShowBookingModal(true);
  };

  return (
    <div className="py-4 bg-light">
      <div className="container">
        {/* Header Breadcrumb & Heading */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Equipment Catalog & Marketplace</h2>
            <p className="text-muted small mb-0">
              Browse {total} commercial and industrial machines available for rent with verified availability.
            </p>
          </div>

          {/* Quick sort dropdown */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <span className="small text-muted fw-bold">Sort By:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: '190px' }}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest Added</option>
              <option value="price-asc">Daily Rate: Low to High</option>
              <option value="price-desc">Daily Rate: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="popular">Most Rented Fleet</option>
            </select>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Filter Sidebar */}
          <div className="col-lg-3">
            <div className="card filter-card p-3 shadow-sm border-0 sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <span className="fw-bold fs-6">
                  <i className="bi bi-funnel me-1 text-primary"></i>Filters
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-link btn-sm text-decoration-none text-muted p-0 small"
                >
                  Reset All
                </button>
              </div>

              {/* Keyword Search */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Search Keywords</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Machine title, model..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearch('')}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Location */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Metro Location</label>
                <select
                  className="form-select form-select-sm"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Locations</option>
                  <option value="Austin">Austin, TX</option>
                  <option value="Dallas">Dallas, TX</option>
                  <option value="Houston">Houston, TX</option>
                </select>
              </div>

              {/* Daily Rate Price Range */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Daily Rate ($)</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min $"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max $"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-2">
                <label className="form-label small fw-bold">Equipment Condition</label>
                <div className="d-flex flex-column gap-1">
                  {['', 'Like New', 'Excellent', 'Good', 'Fair'].map((c) => (
                    <div key={c || 'all'} className="form-check small">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="conditionOpt"
                        id={`cond_${c || 'all'}`}
                        checked={condition === c}
                        onChange={() => {
                          setCondition(c);
                          setPage(1);
                        }}
                      />
                      <label className="form-check-label text-secondary" htmlFor={`cond_${c || 'all'}`}>
                        {c || 'Any Condition'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Equipment Listings Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5 bg-white rounded-3 border">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted small">Loading available equipment...</div>
              </div>
            ) : equipmentList.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-3 border">
                <div className="p-3 rounded-circle bg-light d-inline-flex mb-3 text-muted">
                  <i className="bi bi-search fs-1"></i>
                </div>
                <h5 className="fw-bold">No Equipment Found</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                  We could not find equipment matching your search filters. Try clearing your filters or widening your price range.
                </p>
                <button onClick={handleClearFilters} className="btn btn-outline-primary btn-sm fw-bold">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {equipmentList.map((eq) => (
                    <div key={eq._id} className="col-md-6 col-lg-4">
                      <EquipmentCard equipment={eq} onBookClick={handleBookClick} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="d-flex justify-content-center mt-5">
                    <ul className="pagination shadow-sm">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li
                          key={i + 1}
                          className={`page-item ${page === i + 1 ? 'active' : ''}`}
                        >
                          <button className="page-link" onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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

export default EquipmentCatalogPage;
