// src/routes/AdminProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const AdminRoutes = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const admin = JSON.parse(localStorage.getItem('adminData'));

  return token && admin ? children : <Navigate to="/admin/login" />;
};

export default AdminRoutes;
