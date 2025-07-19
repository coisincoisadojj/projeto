import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RotasPrivadas({ children, rolePermitido }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (rolePermitido && role !== rolePermitido) return <Navigate to="/catalogo" />;

  return children;
}
