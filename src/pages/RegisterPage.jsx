import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApplicant } from '../api/api';
import { User, MapPin, GraduationCap, Briefcase, ChevronRight, ChevronLeft, Send, ShieldAlert } from 'lucide-react';

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
  'Cook / Kitchen Helper', 'Security Guard', 'IT Support', 'General Helper / Labour', 'Other'
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: 'Kerala',
    education: '',
    work_type: '',
    experience_years: '',
    skills: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    
    // Clear error for this field as they type
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Validate step-specific fields before proceeding
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      // Step 1: Personal Info
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Full Name is required';
      } else if (formData.full_name.trim().length < 3) {
        newErrors.full_name = 'Name must be at least 3 characters';
      } else if (!/^[A-Za-z\s]+$/.test(formData.full_name)) {
        newErrors.full_name = 'Name should contain letters and spaces only';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email Address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone Number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)';
      }
    } else if (step === 2) {
      // Step 2: Location
      if (!formData.district) {
        newErrors.district = 'Please select your District';
      }
    } else if (step === 3) {
      // Step 3: Education
      if (!formData.education) {
        newErrors.education = 'Highest Education is required';
      }
    } else if (step === 4) {
      // Step 4: Work experience
      if (!formData.work_type) {
        newErrors.work_type = 'Type of Work is required';
      }
      if (formData.experience_years === '') {
        newErrors.experience_years = 'Years of Experience is required';
      } else {
        const exp = parseInt(formData.experience_years, 10);
        if (isNaN(exp) || exp < 0 || exp > 50) {
          newErrors.experience_years = 'Experience must be between 0 and 50 years';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setServerError('');

    try {
      await registerApplicant(formData);
      // Navigate to success page and pass the applicant name via route state
      navigate('/success', { state: { applicantName: formData.full_name } });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal', icon: <User size={16} /> },
    { num: 2, label: 'Location', icon: <MapPin size={16} /> },
    { num: 3, label: 'Education', icon: <GraduationCap size={16} /> },
    { num: 4, label: 'Work details', icon: <Briefcase size={16} /> }
  ];

  return (
    <div className="app-container hero-gradient">
      <header className="nav-header">
        <Link to="/" className="brand">
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            M
          </div>
          <span className="brand-title">Manpower Chain</span>
        </Link>
        <Link to="/admin/login" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          Admin Portal
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div className="card-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Worker Registration</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Register details below to receive career placement recommendations.</p>
          </div>

          {/* Progress Stepper bar */}
          <div className="stepper">
            <div className="stepper-progress" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
            {steps.map((s) => (
              <div 
                key={s.num} 
                className={`step-node ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}`}
              >
                {s.icon}
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitForm} style={{ marginTop: '1.5rem' }}>
            
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                  <User size={20} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Personal Information</h3>
                </div>

                <div className="form-group">
                  <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange('full_name')}
                    placeholder="Enter your full name"
                    autoFocus
                  />
                  {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder="name@example.com"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone Number <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Home Address</label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="Describe your current home address details"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location Details */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                  <MapPin size={20} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Location Details</h3>
                </div>

                <div className="form-group">
                  <label>District <span style={{ color: 'red' }}>*</span></label>
                  <select
                    value={formData.district}
                    onChange={handleInputChange('district')}
                    autoFocus
                  >
                    <option value="">-- Select District --</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && <span className="error-text">{errors.district}</span>}
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    placeholder="Kerala"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Education Details */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                  <GraduationCap size={20} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Education Level</h3>
                </div>

                <div className="form-group">
                  <label>Highest Qualification <span style={{ color: 'red' }}>*</span></label>
                  <select
                    value={formData.education}
                    onChange={handleInputChange('education')}
                    autoFocus
                  >
                    <option value="">-- Select Qualification --</option>
                    {EDUCATION_OPTIONS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  {errors.education && <span className="error-text">{errors.education}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Work Experience Details */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                  <Briefcase size={20} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Work & Skills Information</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type of Job Category <span style={{ color: 'red' }}>*</span></label>
                    <select
                      value={formData.work_type}
                      onChange={handleInputChange('work_type')}
                      autoFocus
                    >
                      <option value="">-- Select Category --</option>
                      {WORK_TYPES.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    {errors.work_type && <span className="error-text">{errors.work_type}</span>}
                  </div>

                  <div className="form-group">
                    <label>Years of Work Experience <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={handleInputChange('experience_years')}
                      placeholder="Enter 0 if you are fresher"
                    />
                    {errors.experience_years && <span className="error-text">{errors.experience_years}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Skills (optional)</label>
                  <textarea
                    rows="3"
                    value={formData.skills}
                    onChange={handleInputChange('skills')}
                    placeholder="E.g., Plumbing tools, Driving License, Heavy vehicle HMV, Welding, Carpentry"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Separate multiple skills using commas.
                  </p>
                </div>
              </div>
            )}

            {serverError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }} className="animate-fade-in">
                <ShieldAlert size={18} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Stepper Wizard Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <div></div> // empty spacer
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center' }}
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Application
                      <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

          </form>

        </div>
      </main>
    </div>
  );
}
