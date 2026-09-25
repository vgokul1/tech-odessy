import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { equipmentAPI, categoryAPI } from '../services/api';
import EquipmentCard from '../components/EquipmentCard';

const EquipmentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [equipments, setEquipments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getAll();
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch equipments based on query
  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (category && category !== 'all') params.category = category;
      if (condition && condition !== 'all') params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (city.trim()) params.city = city.trim();
      if (minRating) params.minRating = minRating;

      const res = await equipmentAPI.getAll(params);
      if (res.data.success) {
        setEquipments(res.data.data);
        setPagination({
          total: res.data.total,
          totalPages: res.data.totalPages,
          currentPage: res.data.currentPage,
        });
      }
    } catch (err) {
      console.error('Error loading equipment catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, minPrice, maxPrice, city, minRating, sort, page]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  // Sync state to URL params
  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'all') params.set('category', category);
    if (condition && condition !== 'all') params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (city.trim()) params.set('city', city.trim());
    if (minRating) params.set('minRating', minRating);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setPage(1);
    updateURLParams();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setCity('');
    setMinRating('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb / Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Equipment Catalog</h2>
          <p className="text-muted small mb-0">
            Showing <strong className="text-dark">{pagination.total}</strong> verified equipment listings available for rent
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <label className="small text-muted fw-semibold">Sort by:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '180px' }}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Customer Rated</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar Filters */}
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 p-3 p-lg-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-funnel me-1 text-primary"></i> Filter Equipment
              </h6>
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilter}>
              {/* Keyword Search */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Keyword</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Excavator, Camera..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name} ({c.equipmentCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Rate Price Range */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Daily Rate ($/day)</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Condition</label>
                <select
                  className="form-select form-select-sm"
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Any Condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              {/* City / Location */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">City / Location</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              {/* Minimum Rating */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Minimum Rating</label>
                <div className="d-flex flex-column gap-1 small">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="ratingFilter"
                      id="ratingAll"
                      checked={minRating === ''}
                      onChange={() => setMinRating('')}
                    />
                    <label className="form-check-label" htmlFor="ratingAll">
                      All Ratings
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="ratingFilter"
                      id="rating4"
                      checked={minRating === '4'}
                      onChange={() => setMinRating('4')}
                    />
                    <label className="form-check-label text-warning" htmlFor="rating4">
                      <i className="bi bi-star-fill me-1"></i>
                      <i className="bi bi-star-fill me-1"></i>
                      <i className="bi bi-star-fill me-1"></i>
                      <i className="bi bi-star-fill me-1"></i>
                      <span className="text-dark">&amp; Up</span>
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm w-100 py-2 fw-semibold rounded-3">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Equipment Results Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted small">Loading equipment catalog...</p>
            </div>
          ) : equipments.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border p-5">
              <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
              <h4>No Equipment Found</h4>
              <p className="text-muted small mb-4">
                We couldn't find any equipment matching your current filters. Try loosening your criteria or resetting filters.
              </p>
              <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {equipments.map((eq) => (
                  <div key={eq._id} className="col-md-6 col-xl-4">
                    <EquipmentCard equipment={eq} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <nav aria-label="Catalog pagination">
                    <ul className="pagination pagination-sm shadow-sm">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(pagination.totalPages)].map((_, idx) => (
                        <li
                          key={idx + 1}
                          className={`page-item ${pagination.currentPage === idx + 1 ? 'active' : ''}`}
                        >
                          <button className="page-link" onClick={() => setPage(idx + 1)}>
                            {idx + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;
