import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, isDemoMode } from '../api/api';
import { LogIn, Lock, Mail, ShieldAlert, Info, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(isDemoMode());

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // Keep track of the active mode
  useEffect(() => {
    const checkMode = () => {
      setDemo(isDemoMode());
    };
    window.addEventListener('storage', checkMode);
    return () => window.removeEventListener('storage', checkMode);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(email, password);
      localStorage.setItem('admin_token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          Back to Registration Form
        </Link>
      </div>

      <div className="card-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-primary)', justifyContent: 'center', marginBottom: '1rem' }}>
            <Lock size={20} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Portal Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {demo ? 'Accessing dashboard in Demo Mode' : 'Sign in to access secure dashboard data'}
          </p>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@yourcompany.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500 }} className="animate-fade-in">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={16} />
                Access Dashboard
              </>
            )}
          </button>
        </form>

        {demo && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '8px', marginTop: '2rem', fontSize: '0.8rem', lineHeight: '1.4' }} className="animate-fade-in">
            <Info size={16} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Demo Mode Default Credentials:</p>
              <p><strong>Email:</strong> admin@yourcompany.com</p>
              <p><strong>Password:</strong> YourStrongPassword123!</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
