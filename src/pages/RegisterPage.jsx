import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
    companyName: '',
    phone: '',
    city: 'Austin',
    state: 'TX',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      companyName: formData.companyName,
      phone: formData.phone,
      address: {
        city: formData.city,
        state: formData.state,
      },
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      if (formData.role === 'owner') {
        navigate('/dashboard/owner');
      } else {
        navigate('/dashboard/customer');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5 bg-white">
              <div className="text-center mb-4">
                <span className="p-3 rounded-circle bg-warning d-inline-flex text-dark mb-2">
                  <i className="bi bi-person-plus-fill fs-3"></i>
                </span>
                <h3 className="fw-bold text-dark">Join RentalHub Marketplace</h3>
                <p className="text-muted small">Choose your account type and start renting or listing equipment</p>
              </div>

              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Role Switcher Pills */}
                <div className="mb-4">
                  <label className="form-label small fw-bold d-block text-center">I want to:</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn flex-fill py-2 fw-bold small ${
                        formData.role === 'customer' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setFormData({ ...formData, role: 'customer' })}
                    >
                      <i className="bi bi-person me-1"></i>Rent Equipment (Customer)
                    </button>
                    <button
                      type="button"
                      className={`btn flex-fill py-2 fw-bold small ${
                        formData.role === 'owner' ? 'btn-warning text-dark' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setFormData({ ...formData, role: 'owner' })}
                    >
                      <i className="bi bi-truck me-1"></i>List Fleet (Equipment Owner)
                    </button>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Full Name / Primary Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe or Jane Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Company / Business Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Apex Civil Contractors"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold">Work Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold">Password (min 6 characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-warning w-100 py-2 fw-bold shadow-sm mt-4 mb-3"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center small text-muted">
                Already registered with RentalHub?{' '}
                <Link to="/login" className="fw-bold text-primary text-decoration-none">
                  Log in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
