import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import ApplicantTable from '../components/ApplicantTable';
import { fetchApplicants, exportExcel, isDemoMode, adminLogout } from '../api/api';
import { LogOut, Download, RefreshCw, Layers, Users, Clock, Star, CheckCircle, Database } from 'lucide-react';

const EMPTY_FILTERS = {
  district: '',
  education: '',
  work_type: '',
  min_exp: '',
  max_exp: '',
  status: '',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // App mode state (Demo / Live Server)
  const [demoMode, setDemoMode] = useState(isDemoMode());

  // Overall Statistics calculated from the total list of applicants (unfiltered or overall database)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    placed: 0,
  });

  // Calculate clean query filters (remove empty keys)
  const getCleanFilters = (f) => {
    return Object.fromEntries(
      Object.entries(f).filter(([, val]) => val !== '')
    );
  };

  // Re-fetch data from API / Mock storage
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters = getCleanFilters(filters);
      const res = await fetchApplicants(cleanFilters);
      setApplicants(res.data.applicants);
      setTotal(res.data.total);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Calculate stats based on ALL applicants in the system
      const allRes = await fetchApplicants({});
      const allItems = allRes.data.applicants;
      setStats({
        total: allItems.length,
        pending: allItems.filter(a => a.status === 'pending').length,
        shortlisted: allItems.filter(a => a.status === 'shortlisted').length,
        placed: allItems.filter(a => a.status === 'placed').length,
      });

    } catch (err) {
      console.error('Fetch applicants error:', err);
      // Unauthorized or invalid session: redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle logging out
  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  // Handle spreadsheet export
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const cleanFilters = getCleanFilters(filters);
      await exportExcel(cleanFilters);
    } catch (err) {
      console.error('Excel download failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Toggle mode (Demo / Live)
  const handleModeToggle = () => {
    const nextMode = demoMode ? 'live' : 'demo';
    localStorage.setItem('app_mode', nextMode);
    setDemoMode(nextMode === 'demo');
    // Dispatch a dummy storage event so other open pages update too
    window.dispatchEvent(new Event('storage'));
    
    // Clear filters and reload
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="app-container">
      {/* Admin header */}
      <header className="nav-header" style={{ padding: '0.75rem 2rem' }}>
        <Link to="/admin/dashboard" className="brand">
          <div style={{ width: '2rem', height: '2rem', borderRadius: '6px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
            A
          </div>
          <span className="brand-title" style={{ fontSize: '1.1rem' }}>Admin Dashboard</span>
        </Link>

        {/* Action controls in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Live vs Demo Toggle Switch */}
          <div className="switch-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: demoMode ? 'var(--text-secondary)' : 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem' }}>
              <Database size={14} />
              <span>{demoMode ? 'Demo Database' : 'Live API Server'}</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={!demoMode} onChange={handleModeToggle} />
              <span className="slider"></span>
            </label>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Updated: {lastUpdated || 'Loading...'}
          </span>

          <button 
            className="btn btn-outline" 
            onClick={loadData}
            title="Refresh Data"
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Main dashboard body */}
      <main style={{ flex: 1, padding: '2rem' }}>
        
        {/* Dynamic statistics counter cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Users size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Registered</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
              <Clock size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-shortlisted-bg)', color: 'var(--status-shortlisted-text)' }}>
              <Star size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{stats.shortlisted}</span>
              <span className="stat-label">Shortlisted</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-placed-bg)', color: 'var(--status-placed-text)' }}>
              <CheckCircle size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{stats.placed}</span>
              <span className="stat-label">Successfully Placed</span>
            </div>
          </div>
        </div>

        {/* Interactive Filters Panel */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onReset={() => setFilters(EMPTY_FILTERS)} 
        />

        {/* Table summary actions bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Applicants ({total} matching)
          </h2>

          <button
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={total === 0 || exporting}
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              fontSize: '0.9rem',
              padding: '0.6rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={16} />
            {exporting ? 'Downloading...' : 'Download Excel (.xlsx)'}
          </button>
        </div>

        {/* Data results list table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} className="spin" style={{ animationDuration: '1.5s', color: 'var(--color-primary)' }} />
            <span>Updating applicant register...</span>
          </div>
        ) : (
          <ApplicantTable 
            applicants={applicants} 
            onStatusChange={loadData} 
          />
        )}
      </main>

      {/* CSS Spin Keyframes for loading icon */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
