import React from 'react';
import { updateStatus } from '../api/api';
import { Phone, Mail, Award, Calendar, SearchCheck } from 'lucide-react';

export default function ApplicantTable({ applicants, onStatusChange }) {
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      onStatusChange(); // Trigger reload of applicants in parent page
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating applicant status. Please try again.');
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="table-container animate-fade-in">
        <div className="empty-state">
          <SearchCheck size={64} style={{ color: 'var(--text-muted)' }} />
          <h3>No Applicants Found</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            No records match the current filter selection. Try adjusting or resetting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container animate-fade-in">
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant Name</th>
              <th>Contact Details</th>
              <th>District & State</th>
              <th>Qualification</th>
              <th>Work Details</th>
              <th style={{ textAlign: 'center' }}>Exp (Yrs)</th>
              <th>Skills</th>
              <th>Application Status</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a, i) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                  #{a.id}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {a.full_name}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <a href={`tel:${a.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                      <Phone size={12} />
                      {a.phone}
                    </a>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <Mail size={12} />
                      {a.email}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{a.district}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {a.state || 'Kerala'}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} style={{ color: 'var(--color-accent)' }} />
                    <span>{a.education}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{a.work_type}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  {a.experience_years}
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
                  {a.skills ? (
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {a.skills}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td>
                  <div className={`status-select-wrapper ${a.status}`}>
                    <select
                      className="status-select"
                      value={a.status}
                      onChange={(e) => handleStatusUpdate(a.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="placed">Placed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Calendar size={12} />
                    {new Date(a.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
