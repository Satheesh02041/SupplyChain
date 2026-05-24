import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Plus } from 'lucide-react';

export default function SuccessPage() {
  const location = useLocation();
  const applicantName = location.state?.applicantName || 'Applicant';

  return (
    <div className="app-container hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', textAlign: 'center', padding: '3.5rem 2rem' }}>
        
        {/* Animated Checkmark UI */}
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Registration Successful!
        </h2>
        
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Thank you, {applicantName}!
        </p>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          Your profile details have been saved to our manpower supply chain network. Our operations team will review your qualifications and contact you soon.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link 
            to="/" 
            className="btn btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Plus size={16} />
            Register Another Person
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} />
            <span>Secure Public Form Submission</span>
          </div>
        </div>

      </div>
    </div>
  );
}
