import React from 'react';
import { RotateCcw, Filter } from 'lucide-react';

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const EDUCATION_OPTIONS = [
  'Below SSLC', 'SSLC', 'Plus Two', 'ITI', 'Diploma', 'Degree', 'Post Graduate'
];

const WORK_TYPES = [
  'Construction Worker', 'Plumber', 'Electrician', 'Driver', 'Cleaning Staff',
  'Cook / Kitchen Helper', 'Security Guard', 'IT Support', 'General Helper', 'Other'
];

export default function FilterBar({ filters, setFilters, onReset }) {
  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <div className="filter-panel animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Filter size={18} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Filter Applicants</h3>
      </div>
      
      <div className="filter-grid">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>District</label>
          <select value={filters.district} onChange={handleFilterChange('district')}>
            <option value="">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Education</label>
          <select value={filters.education} onChange={handleFilterChange('education')}>
            <option value="">All Education</option>
            {EDUCATION_OPTIONS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Work Type</label>
          <select value={filters.work_type} onChange={handleFilterChange('work_type')}>
            <option value="">All Work Types</option>
            {WORK_TYPES.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Min Experience (Yrs)</label>
          <input
            type="number"
            min="0"
            max="50"
            value={filters.min_exp}
            onChange={handleFilterChange('min_exp')}
            placeholder="0"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Max Experience (Yrs)</label>
          <input
            type="number"
            min="0"
            max="50"
            value={filters.max_exp}
            onChange={handleFilterChange('max_exp')}
            placeholder="50"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Status</label>
          <select value={filters.status} onChange={handleFilterChange('status')}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="placed">Placed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={onReset}
          style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
