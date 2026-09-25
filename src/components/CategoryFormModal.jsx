import React, { useState, useEffect } from 'react';
import API from '../services/api';

const CategoryFormModal = ({ show, onClose, categoryToEdit, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'bi-tools',
    image: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        icon: categoryToEdit.icon || 'bi-tools',
        image: categoryToEdit.image || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'bi-tools',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      });
    }
  }, [categoryToEdit, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      if (categoryToEdit) {
        await API.put(`/categories/${categoryToEdit._id}`, formData);
      } else {
        await API.post('/categories', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fs-6 fw-bold">
              <i className="bi bi-folder-plus text-warning me-2"></i>
              {categoryToEdit ? 'Edit Category' : 'Create Category'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMessage && <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>}

              <div className="mb-3">
                <label className="form-label small fw-bold">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Earthmoving & Excavation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Summary of equipment types included in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Bootstrap Icon Class</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className={`bi ${formData.icon}`}></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="bi-tools, bi-truck, bi-speaker..."
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Cover Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary fw-bold px-4">
                {submitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
