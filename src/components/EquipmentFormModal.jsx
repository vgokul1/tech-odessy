import React, { useState, useEffect } from 'react';
import API from '../services/api';

const EquipmentFormModal = ({ show, onClose, equipmentToEdit, onSaved, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    dailyRate: '',
    hourlyRate: '',
    securityDeposit: '',
    condition: 'Excellent',
    location: {
      address: '',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    images: [''],
    specs: [
      { key: 'Operating Weight', value: '' },
      { key: 'Horsepower / Power', value: '' },
    ],
    featured: false,
    availability: { isAvailable: true, blockedDates: [] },
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        title: equipmentToEdit.title || '',
        category: equipmentToEdit.category?._id || equipmentToEdit.category || '',
        description: equipmentToEdit.description || '',
        dailyRate: equipmentToEdit.dailyRate || '',
        hourlyRate: equipmentToEdit.hourlyRate || '',
        securityDeposit: equipmentToEdit.securityDeposit || '',
        condition: equipmentToEdit.condition || 'Excellent',
        location: {
          address: equipmentToEdit.location?.address || '',
          city: equipmentToEdit.location?.city || 'Austin',
          state: equipmentToEdit.location?.state || 'TX',
          zipCode: equipmentToEdit.location?.zipCode || '78701',
        },
        images: equipmentToEdit.images?.length > 0 ? equipmentToEdit.images : [''],
        specs: equipmentToEdit.specs?.length > 0 ? equipmentToEdit.specs : [{ key: '', value: '' }],
        featured: !!equipmentToEdit.featured,
        availability: equipmentToEdit.availability || { isAvailable: true, blockedDates: [] },
      });
    } else {
      setFormData({
        title: '',
        category: categories?.[0]?._id || '',
        description: '',
        dailyRate: '',
        hourlyRate: '',
        securityDeposit: 150,
        condition: 'Excellent',
        location: { address: '', city: 'Austin', state: 'TX', zipCode: '78701' },
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        specs: [
          { key: 'Capacity', value: 'Standard Duty' },
          { key: 'Power Source', value: 'Diesel / Electric' },
        ],
        featured: false,
        availability: { isAvailable: true, blockedDates: [] },
      });
    }
  }, [equipmentToEdit, categories, show]);

  if (!show) return null;

  const handleImageChange = (index, val) => {
    const updated = [...formData.images];
    updated[index] = val;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    if (formData.images.length === 1) return;
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSpecChange = (index, field, val) => {
    const updated = [...formData.specs];
    updated[index][field] = val;
    setFormData({ ...formData, specs: updated });
  };

  const addSpecField = () => {
    setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
  };

  const removeSpecField = (index) => {
    setFormData({
      ...formData,
      specs: formData.specs.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      // Filter empty image urls and specs
      const cleanImages = formData.images.filter((url) => url.trim().length > 0);
      const cleanSpecs = formData.specs.filter((s) => s.key.trim().length > 0);

      const payload = {
        ...formData,
        images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        specs: cleanSpecs,
        dailyRate: Number(formData.dailyRate),
        securityDeposit: Number(formData.securityDeposit) || 0,
      };

      if (equipmentToEdit) {
        await API.put(`/equipment/${equipmentToEdit._id}`, payload);
      } else {
        await API.post('/equipment', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-tools text-warning me-2"></i>
              {equipmentToEdit ? 'Edit Equipment Listing' : 'Publish New Rental Equipment'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMessage && <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>}

              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-bold">Equipment Title / Model Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Caterpillar 305.5 Mini Excavator"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Detailed Technical Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Features, attachments included, ideal job site uses, operating notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Daily Rate ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="250"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Security Deposit ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="500"
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Condition Rating</label>
                  <select
                    className="form-select"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Yard / Pickup Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="4500 Industrial Blvd"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, address: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Austin"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">State / ZIP</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="TX"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value },
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="78701"
                      value={formData.location.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, zipCode: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold mb-0">High-Res Photo URLs</label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="btn btn-sm btn-outline-primary py-0"
                    >
                      <i className="bi bi-plus-lg me-1"></i>Add Another Photo
                    </button>
                  </div>
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="input-group mb-2">
                      <span className="input-group-text small">Photo #{idx + 1}</span>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={img}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        required={idx === 0}
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeImageField(idx)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Specifications Key-Values */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold mb-0">Technical Specifications</label>
                    <button
                      type="button"
                      onClick={addSpecField}
                      className="btn btn-sm btn-outline-primary py-0"
                    >
                      <i className="bi bi-plus-lg me-1"></i>Add Spec Field
                    </button>
                  </div>
                  {formData.specs.map((spec, idx) => (
                    <div key={idx} className="row g-2 mb-2 align-items-center">
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Feature (e.g. Dig Depth)"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Value (e.g. 12.5 ft)"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-1 text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => removeSpecField(idx)}
                        >
                          <i className="bi bi-x-circle fs-5"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Availability toggles */}
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="availSwitch"
                      checked={formData.availability.isAvailable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: { ...formData.availability, isAvailable: e.target.checked },
                        })
                      }
                    />
                    <label className="form-check-label small fw-bold" htmlFor="availSwitch">
                      Listing is Active & Open for Booking Reservations
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary fw-bold px-4">
                {submitting ? 'Saving...' : equipmentToEdit ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
