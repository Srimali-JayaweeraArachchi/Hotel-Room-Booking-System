import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';

function AdminRoute({ allowedRoles = ['admin'] }) {
  const { isInitializing, user } = useAuth();
  if (isInitializing) return <main className="centered-state"><span className="spinner" /><p>Checking permissions...</p></main>;
  if (!user) return <Navigate replace to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate replace to="/dashboard" />;
  return <Outlet />;
}

export default AdminRoute;
