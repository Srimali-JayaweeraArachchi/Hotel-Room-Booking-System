import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { useNotifications } from '../context/notificationContext.js';

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name?.trim() || user?.email;
  const { unreadCount } = useNotifications();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Hotel booking home">
          <span className="brand-mark">H</span>
          <span>
            <strong>HavenStay</strong>
            <small>Hotel booking</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/rooms">Rooms</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {user?.role === 'guest' && <NavLink to="/bookings">My bookings</NavLink>}
              {user?.role === 'guest' && <NavLink to="/reviews">My reviews</NavLink>}
              <NavLink className="notification-link" to="/notifications">Notifications{unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}</NavLink>
              {user?.role === 'admin' && <NavLink to="/admin/inventory">Inventory</NavLink>}
              {user?.role === 'admin' && <NavLink to="/admin/users">Users</NavLink>}
              {(user?.role === 'admin' || user?.role === 'staff') && <NavLink to="/admin/bookings">{user.role === 'staff' ? 'Manage bookings' : 'View bookings'}</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="button button-primary button-small" to="/register">
                Create account
              </Link>
            </>
          )}
        </nav>

        {user && <div className="header-account"><Link className="header-user" to="/profile" title={`${displayName} - View profile`}>Hi, {displayName}</Link><button className="header-logout" onClick={handleLogout} type="button">Log out</button></div>}
      </header>

      <Outlet />

      <footer className="site-footer">
        <span>HavenStay Hotel Room Booking System</span>
        <span>EC8208 Software Architecture Prototype</span>
      </footer>
    </div>
  );
}

export default AppLayout;
