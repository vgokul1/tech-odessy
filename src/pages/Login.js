import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Navigate according to role if coming from login directly
        if (from === '/') {
          if (res.user.role === 'admin') navigate('/admin');
          else if (res.user.role === 'owner') navigate('/owner/dashboard');
          else navigate('/dashboard');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 p-4 p-md-5 rounded-4">
            <div className="text-center mb-4">
              <div className="brand-icon mx-auto mb-2" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                <i className="bi bi-box-seam-fill"></i>
              </div>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="text-muted small">Log in to your RentalHub account</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 small mb-3">
                <i className="bi bi-exclamation-circle me-1"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-muted mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Pair Programming & Testing */}
            <div className="bg-light p-3 rounded-3 mt-2 border">
              <div className="small fw-bold text-muted mb-2 text-uppercase font-monospace" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Demo Login
              </div>
              <div className="d-grid gap-1.5">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start py-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleQuickLogin('john@example.com', 'customer123')}
                >
                  <i className="bi bi-person me-1 text-primary"></i> <strong>Customer:</strong> john@example.com
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start py-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleQuickLogin('apexgear@rentalhub.com', 'owner123')}
                >
                  <i className="bi bi-building me-1 text-warning"></i> <strong>Owner:</strong> apexgear@rentalhub.com
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start py-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleQuickLogin('admin@rentalhub.com', 'admin123')}
                >
                  <i className="bi bi-shield-check me-1 text-purple text-primary"></i> <strong>Admin:</strong> admin@rentalhub.com
                </button>
              </div>
            </div>

            <div className="text-center mt-4 text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
