import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    // Redirect to login page if unauthorized
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
