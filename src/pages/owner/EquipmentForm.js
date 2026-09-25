import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { equipmentAPI, categoryAPI } from '../../services/api';

const EquipmentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Like New');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80']);
  const [specifications, setSpecifications] = useState([
    { key: 'Operating Weight', value: '' },
  ]);

  // Load categories & equipment if in edit mode
  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await categoryAPI.getAll();
        if (catRes.data.success) {
          setCategories(catRes.data.data);
          if (!isEdit && catRes.data.data.length > 0) {
            setCategory(catRes.data.data[0]._id);
          }
        }

        if (isEdit) {
          const equipRes = await equipmentAPI.getById(id);
          if (equipRes.data.success) {
            const eq = equipRes.data.data;
            setTitle(eq.title);
            setCategory(eq.category?._id || eq.category);
            setCondition(eq.condition);
            setDailyRate(eq.dailyRate);
            setWeeklyRate(eq.weeklyRate || '');
            setSecurityDeposit(eq.securityDeposit || '');
            setDescription(eq.description);
            setCity(eq.location?.city || '');
            setState(eq.location?.state || '');
            setZip(eq.location?.zip || '');
            setAddress(eq.location?.address || '');
            if (eq.images && eq.images.length > 0) setImages(eq.images);
            if (eq.specifications && eq.specifications.length > 0) setSpecifications(eq.specifications);
          }
        }
      } catch (err) {
        console.error('Error loading equipment form data:', err);
        setErrorMsg('Error loading form data');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEdit]);

  // Image helpers
  const handleAddImage = () => {
    setImages((prev) => [...prev, '']);
  };

  const handleImageChange = (index, value) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Spec helpers
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemoveSpec = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Filter valid specifications & images
    const validSpecs = specifications.filter((s) => s.key.trim() && s.value.trim());
    const validImages = images.filter((img) => img.trim() !== '');

    const payload = {
      title,
      category,
      condition,
      dailyRate: Number(dailyRate),
      weeklyRate: weeklyRate ? Number(weeklyRate) : Number(dailyRate) * 6,
      securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
      description,
      location: { city, state, zip, address },
      images: validImages.length > 0 ? validImages : undefined,
      specifications: validSpecs,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await equipmentAPI.update(id, payload);
      } else {
        await equipmentAPI.create(payload);
      }
      navigate('/owner/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving equipment listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 small">
                <li className="breadcrumb-item"><Link to="/owner/dashboard">Owner Portal</Link></li>
                <li className="breadcrumb-item active">{isEdit ? 'Edit Equipment' : 'New Listing'}</li>
              </ol>
            </nav>
            <Link to="/owner/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              Cancel
            </Link>
          </div>

          <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
            <h3 className="fw-bold mb-1">{isEdit ? 'Edit Equipment Listing' : 'List New Equipment'}</h3>
            <p className="text-muted small mb-4">
              Provide thorough specifications, accurate pricing, and high-resolution images to attract verified renters.
            </p>

            {errorMsg && (
              <div className="alert alert-danger py-2 small mb-3">
                <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label small fw-bold text-muted">Equipment Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Caterpillar 301.8 Mini Hydraulic Excavator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Condition</label>
                  <select
                    className="form-select"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                {/* Rates */}
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Daily Rate ($/day)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="150"
                      min="1"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Security Deposit ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="500"
                      min="0"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Equipment Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Detail the capabilities, included attachments, maintenance history, and power requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Location */}
              <h6 className="fw-bold mb-3 small text-uppercase">Pickup &amp; Storage Location</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Street Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="1240 Folsom St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold text-muted">City</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-1 col-3">
                  <label className="form-label small fw-semibold text-muted">State</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2 col-3">
                  <label className="form-label small fw-semibold text-muted">Zip</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>

              {/* Image URLs */}
              <h6 className="fw-bold mb-2 small text-uppercase">Photos &amp; Imagery (URLs)</h6>
              <div className="mb-4">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="input-group input-group-sm mb-2">
                    <span className="input-group-text bg-light">{idx + 1}</span>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={imgUrl}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill mt-1"
                  onClick={handleAddImage}
                >
                  <i className="bi bi-plus me-1"></i> Add Another Photo URL
                </button>
              </div>

              {/* Dynamic Technical Specifications */}
              <h6 className="fw-bold mb-2 small text-uppercase">Technical Specifications</h6>
              <div className="mb-4">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="row g-2 mb-2 align-items-center">
                    <div className="col-5">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Feature name (e.g. Engine Power)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Value (e.g. 24.9 HP Kubota Diesel)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-1 text-center">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 rounded-circle"
                        style={{ width: '28px', height: '28px', lineHeight: 1 }}
                        onClick={() => handleRemoveSpec(idx)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill mt-1"
                  onClick={handleAddSpec}
                >
                  <i className="bi bi-plus me-1"></i> Add Specification Field
                </button>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-end gap-2">
                <Link to="/owner/dashboard" className="btn btn-outline-secondary rounded-pill px-4">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Listing...' : isEdit ? 'Update Equipment' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentForm;
