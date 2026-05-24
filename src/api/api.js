import axios from 'axios';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// Base API instance (maintained for backward compatibility if ever needed)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: BASE_URL,
});

// Helper to determine if we are in Demo Mode
export const isDemoMode = () => {
  if (!isSupabaseConfigured) {
    return true; // Force demo mode if Supabase is not configured yet
  }
  const mode = localStorage.getItem('app_mode');
  if (!mode) {
    localStorage.setItem('app_mode', 'live'); // Default to live (Supabase) if configured
    return false;
  }
  return mode === 'demo';
};

// Seed mock data if localStorage is empty (Demo Mode)
const SEED_DATA = [
  {
    id: 1,
    full_name: 'Anjali Nair',
    email: 'anjali.nair@email.com',
    phone: '9845612307',
    address: 'Nair Villa, Palarivattom',
    district: 'Ernakulam',
    state: 'Kerala',
    education: 'Degree',
    work_type: 'IT Support',
    experience_years: 3,
    skills: 'MS Office, Hardware troubleshooting, Networking',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    full_name: 'Rahul Kumar',
    email: 'rahul.k@email.com',
    phone: '9746123456',
    address: 'Kumar Nivas, Kaloor',
    district: 'Ernakulam',
    state: 'Kerala',
    education: 'Diploma',
    work_type: 'Electrician',
    experience_years: 5,
    skills: 'Industrial Wiring, Panel maintenance',
    status: 'shortlisted',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    full_name: 'Suresh Gopalan',
    email: 'suresh.g@email.com',
    phone: '9447123987',
    address: 'Suresh Bhavan, East Fort',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    education: 'SSLC',
    work_type: 'Driver',
    experience_years: 12,
    skills: 'Heavy vehicles, Kerala Route knowledge, HMV License',
    status: 'placed',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    full_name: 'Devika M.',
    email: 'devika.m@email.com',
    phone: '8129456789',
    address: 'Murali Nivas, Nilambur',
    district: 'Malappuram',
    state: 'Kerala',
    education: 'Plus Two',
    work_type: 'Cleaning Staff',
    experience_years: 1,
    skills: 'Housekeeping, Office cleaning',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    full_name: 'Jithin Joseph',
    email: 'jithin.j@email.com',
    phone: '7012345678',
    address: 'Joseph Cottage, Kanjirappally',
    district: 'Kottayam',
    state: 'Kerala',
    education: 'ITI',
    work_type: 'Plumber',
    experience_years: 0,
    skills: 'Pipeline repair, Sanitary fittings',
    status: 'rejected',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const getDemoApplicants = () => {
  const data = localStorage.getItem('demo_applicants');
  if (!data) {
    localStorage.setItem('demo_applicants', JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(data);
};

const saveDemoApplicants = (applicants) => {
  localStorage.setItem('demo_applicants', JSON.stringify(applicants));
};

// Helper function to filter client-side data
const filterDemoData = (applicants, filters) => {
  let result = [...applicants];
  
  if (filters.district) {
    result = result.filter(a => a.district.toLowerCase() === filters.district.toLowerCase());
  }
  if (filters.education) {
    result = result.filter(a => a.education.toLowerCase() === filters.education.toLowerCase());
  }
  if (filters.work_type) {
    result = result.filter(a => a.work_type.toLowerCase() === filters.work_type.toLowerCase());
  }
  if (filters.min_exp) {
    const minVal = parseInt(filters.min_exp, 10);
    result = result.filter(a => a.experience_years >= minVal);
  }
  if (filters.max_exp) {
    const maxVal = parseInt(filters.max_exp, 10);
    result = result.filter(a => a.experience_years <= maxVal);
  }
  if (filters.status) {
    result = result.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
  }
  
  // Sort by registration date - newest first
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return result;
};

// ----------------------------------------------------
// API Client Methods (Dual Mode)
// ----------------------------------------------------

// 1. Worker Registration
export const registerApplicant = async (formData) => {
  if (isDemoMode()) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const applicants = getDemoApplicants();
        
        // Email unique check
        const isDuplicate = applicants.some(
          (a) => a.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (isDuplicate) {
          reject({
            response: {
              status: 409,
              data: { message: 'This email is already registered.' }
            }
          });
          return;
        }

        const newId = applicants.length > 0 ? Math.max(...applicants.map(a => a.id)) + 1 : 1;
        const newApplicant = {
          id: newId,
          ...formData,
          state: formData.state || 'Kerala',
          experience_years: parseInt(formData.experience_years, 10) || 0,
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        applicants.push(newApplicant);
        saveDemoApplicants(applicants);
        resolve({ data: { message: 'Registration successful!', applicant: newApplicant } });
      }, 800); // simulate network lag
    });
  } else {
    // Supabase Mode
    const { data, error } = await supabase
      .from('applicants')
      .insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          district: formData.district,
          state: formData.state || 'Kerala',
          education: formData.education,
          work_type: formData.work_type,
          experience_years: parseInt(formData.experience_years, 10) || 0,
          skills: formData.skills,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      throw {
        response: {
          status: error.code === '23505' ? 409 : 500,
          data: { message: error.code === '23505' ? 'This email is already registered.' : error.message }
        }
      };
    }

    return { data: { message: 'Registration successful!', applicant: data[0] } };
  }
};

// 2. Admin Login
export const adminLogin = async (email, password) => {
  if (isDemoMode()) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock admin credentials
        const ADMIN_EMAIL = 'admin@yourcompany.com';
        const ADMIN_PASSWORD = 'YourStrongPassword123!';
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          resolve({ data: { token: 'mock_jwt_token_demo_12345' } });
        } else {
          reject({
            response: {
              status: 401,
              data: { message: 'Invalid email or password' }
            }
          });
        }
      }, 600);
    });
  } else {
    // Supabase Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw {
        response: {
          status: 401,
          data: { message: error.message }
        }
      };
    }

    return { data: { token: data.session.access_token } };
  }
};

// 2.5 Admin Logout
export const adminLogout = async () => {
  localStorage.removeItem('admin_token');
  if (!isDemoMode()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
  }
};

// 3. Fetch Applicants (Admin)
export const fetchApplicants = async (filters) => {
  if (isDemoMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = getDemoApplicants();
        const filtered = filterDemoData(all, filters);
        resolve({
          data: {
            total: filtered.length,
            applicants: filtered,
          }
        });
      }, 500);
    });
  } else {
    // Supabase Fetch
    let query = supabase
      .from('applicants')
      .select('*', { count: 'exact' });

    if (filters.district) {
      query = query.eq('district', filters.district);
    }
    if (filters.education) {
      query = query.eq('education', filters.education);
    }
    if (filters.work_type) {
      query = query.eq('work_type', filters.work_type);
    }
    if (filters.min_exp) {
      query = query.gte('experience_years', parseInt(filters.min_exp, 10));
    }
    if (filters.max_exp) {
      query = query.lte('experience_years', parseInt(filters.max_exp, 10));
    }
    if (filters.status) {
      query = query.eq('status', filters.status.toLowerCase());
    }

    // Sort by registration date - newest first
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw {
        response: {
          status: 500,
          data: { message: error.message }
        }
      };
    }

    return {
      data: {
        total: count || 0,
        applicants: data || [],
      }
    };
  }
};

// 4. Update Status (Admin)
export const updateStatus = async (id, status) => {
  if (isDemoMode()) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const all = getDemoApplicants();
        const index = all.findIndex(a => a.id === parseInt(id, 10));
        if (index !== -1) {
          all[index].status = status;
          saveDemoApplicants(all);
          resolve({ data: { message: 'Status updated successfully.' } });
        } else {
          reject({ response: { status: 404, data: { message: 'Applicant not found.' } } });
        }
      }, 300);
    });
  } else {
    // Supabase Update
    const { data, error } = await supabase
      .from('applicants')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      throw {
        response: {
          status: 500,
          data: { message: error.message }
        }
      };
    }

    if (!data || data.length === 0) {
      throw { response: { status: 404, data: { message: 'Applicant not found.' } } };
    }

    return { data: { message: 'Status updated successfully.' } };
  }
};

// 5. Excel Export
export const exportExcel = async (filters) => {
  if (isDemoMode()) {
    // Generate Excel client-side in Demo Mode using xlsx package
    const all = getDemoApplicants();
    const filtered = filterDemoData(all, filters);
    
    // Transform data columns to match spec requirements exactly
    const dataToExport = filtered.map(a => ({
      'ID': a.id,
      'Full Name': a.full_name,
      'Phone': a.phone,
      'Email': a.email,
      'District': a.district, // dedicated column
      'State': a.state,
      'Education': a.education,
      'Work Type': a.work_type,
      'Experience (yrs)': a.experience_years,
      'Skills': a.skills || '—',
      'Status': a.status.toUpperCase(),
      'Registered On': new Date(a.created_at).toLocaleDateString('en-IN')
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Add custom styling columns width
    const colsWidth = [
      { wch: 6 },   // ID
      { wch: 22 },  // Full Name
      { wch: 15 },  // Phone
      { wch: 28 },  // Email
      { wch: 18 },  // District
      { wch: 14 },  // State
      { wch: 16 },  // Education
      { wch: 18 },  // Work Type
      { wch: 16 },  // Experience (yrs)
      { wch: 30 },  // Skills
      { wch: 14 },  // Status
      { wch: 20 },  // Registered On
    ];
    worksheet['!cols'] = colsWidth;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    
    // Trigger download
    XLSX.writeFile(workbook, `applicants_${Date.now()}.xlsx`);
    return Promise.resolve();
  } else {
    // Supabase Mode Client-Side Excel Generation (No Node Backend needed!)
    const res = await fetchApplicants(filters);
    const filtered = res.data.applicants;

    const dataToExport = filtered.map(a => ({
      'ID': a.id,
      'Full Name': a.full_name,
      'Phone': a.phone,
      'Email': a.email,
      'District': a.district,
      'State': a.state,
      'Education': a.education,
      'Work Type': a.work_type,
      'Experience (yrs)': a.experience_years,
      'Skills': a.skills || '—',
      'Status': a.status.toUpperCase(),
      'Registered On': new Date(a.created_at).toLocaleDateString('en-IN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const colsWidth = [
      { wch: 6 },   // ID
      { wch: 22 },  // Full Name
      { wch: 15 },  // Phone
      { wch: 28 },  // Email
      { wch: 18 },  // District
      { wch: 14 },  // State
      { wch: 16 },  // Education
      { wch: 18 },  // Work Type
      { wch: 16 },  // Experience (yrs)
      { wch: 30 },  // Skills
      { wch: 14 },  // Status
      { wch: 20 },  // Registered On
    ];
    worksheet['!cols'] = colsWidth;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    XLSX.writeFile(workbook, `applicants_${Date.now()}.xlsx`);
    return Promise.resolve();
  }
};
