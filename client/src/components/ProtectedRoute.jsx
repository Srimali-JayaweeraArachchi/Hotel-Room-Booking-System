import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="centered-state" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Checking your session...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
