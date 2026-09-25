import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
        companyName: role === 'owner' ? companyName : '',
        address: { city, state },
      });

      if (res.success) {
        if (role === 'owner') navigate('/owner/dashboard');
        else navigate('/dashboard');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow border-0 p-4 p-md-5 rounded-4">
            <div className="text-center mb-4">
              <div className="brand-icon mx-auto mb-2" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                <i className="bi bi-person-plus-fill"></i>
              </div>
              <h3 className="fw-bold mb-1">Join RentalHub</h3>
              <p className="text-muted small">Choose your account type and start renting</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 small mb-3">
                <i className="bi bi-exclamation-circle me-1"></i> {errorMsg}
              </div>
            )}

            {/* Role Selector Tabs */}
            <div className="btn-group w-100 mb-4 p-1 bg-light rounded-pill" role="group">
              <input
                type="radio"
                className="btn-check"
                name="roleRadio"
                id="roleCustomer"
                autoComplete="off"
                checked={role === 'customer'}
                onChange={() => setRole('customer')}
              />
              <label className="btn btn-sm rounded-pill fw-semibold" htmlFor="roleCustomer">
                <i className="bi bi-person me-1"></i> Customer (Renter)
              </label>

              <input
                type="radio"
                className="btn-check"
                name="roleRadio"
                id="roleOwner"
                autoComplete="off"
                checked={role === 'owner'}
                onChange={() => setRole('owner')}
              />
              <label className="btn btn-sm rounded-pill fw-semibold" htmlFor="roleOwner">
                <i className="bi bi-building me-1"></i> Equipment Owner
              </label>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">City, State</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '70px' }}
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Owner Specific Fields */}
              {role === 'owner' && (
                <div className="mb-3 p-3 bg-light rounded-3 border">
                  <label className="form-label small fw-semibold text-muted">Business / Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bay Area Tool & Heavy Equipment LLC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                  <div className="form-text small" style={{ fontSize: '0.75rem' }}>
                    This name will appear on your equipment rental listings.
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm mb-3 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating Account...
                  </>
                ) : (
                  `Register as ${role === 'owner' ? 'Equipment Owner' : 'Customer'}`
                )}
              </button>
            </form>

            <div className="text-center mt-3 text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
