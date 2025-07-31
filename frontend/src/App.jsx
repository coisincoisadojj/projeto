import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import Login from './pages/login';
import Register from './pages/Register'; // IMPORTAÇÃO CORRETA
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardBibliotecario from './pages/DashboardBibliotecario';
import DashboardLeitor from './pages/DashboardLeitor';

function RequireAuth({ tipoPermitido }) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;

    const decoded = jwtDecode(token);
    if (!tipoPermitido.includes(decoded.tipo)) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route element={<RequireAuth tipoPermitido={['admin']} />}>
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      </Route>

      <Route element={<RequireAuth tipoPermitido={['bibliotecario']} />}>
        <Route path="/dashboard/bibliotecario" element={<DashboardBibliotecario />} />
      </Route>

      <Route element={<RequireAuth tipoPermitido={['leitor']} />}>
        <Route path="/dashboard/leitor" element={<DashboardLeitor />} />
      </Route>
    </Routes>
  );
}
