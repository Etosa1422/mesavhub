import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('userData'));
  return token && user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
