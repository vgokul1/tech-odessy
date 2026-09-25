import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(redirect);
    } else {
      setError(res.message);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError('');
    const res = await quickDemoLogin(role);
    setLoading(false);
    if (res.success) {
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'owner') navigate('/dashboard/owner');
      else navigate('/dashboard/customer');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5 bg-white">
              <div className="text-center mb-4">
                <span className="p-3 rounded-circle bg-warning d-inline-flex text-dark mb-2">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </span>
                <h3 className="fw-bold text-dark">Welcome to RentalHub</h3>
                <p className="text-muted small">Sign in to your account to rent or manage equipment fleets</p>
              </div>

              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm mb-3"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Quick Demo Logins Box */}
              <div className="border rounded-3 p-3 bg-light text-center mb-3">
                <div className="small fw-bold text-muted mb-2">
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i>One-Click Demo Personas:
                </div>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDemo('customer')}
                    className="btn btn-outline-dark btn-sm fw-bold"
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('owner')}
                    className="btn btn-outline-info text-dark btn-sm fw-bold"
                  >
                    Fleet Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('admin')}
                    className="btn btn-outline-danger btn-sm fw-bold"
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="text-center small text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="fw-bold text-primary text-decoration-none">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
