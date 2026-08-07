import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';

function GuestRoute() {
  const { isInitializing, user } = useAuth();
  if (isInitializing) return <main className="centered-state"><span className="spinner" /><p>Checking permissions...</p></main>;
  if (!user) return <Navigate replace to="/login" />;
  if (user.role !== 'guest') return <Navigate replace to="/dashboard" />;
  return <Outlet />;
}

export default GuestRoute;
