import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { changeBookingStatus, getAdminBookings } from '../api/bookingApi.js';
import { getInventory } from '../api/roomApi.js';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function GuestDashboard({ user }) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome guest-welcome">
        <div><p className="eyebrow">Guest dashboard</p><h1>Welcome back, {user.name.split(' ')[0]}.</h1><p>Find your next stay or manage the reservations connected to your account.</p></div>
        <span className="role-badge">Guest</span>
      </section>
      <section className="dashboard-actions">
        <Link className="dashboard-action-card primary-action" to="/rooms"><span>Explore</span><h2>Find a room</h2><p>Search available room types by guest count, dates, and price.</p><strong>Browse rooms -&gt;</strong></Link>
        <Link className="dashboard-action-card" to="/bookings"><span>Reservations</span><h2>My bookings</h2><p>Review, modify, or cancel your eligible hotel reservations.</p><strong>Manage bookings -&gt;</strong></Link>
        <Link className="dashboard-action-card" to="/profile"><span>Account</span><h2>My profile</h2><p>View your account identity, email address, role, and current status.</p><strong>View profile -&gt;</strong></Link>
      </section>
    </main>
  );
}

function AdminDashboard({ user }) {
  const [data, setData] = useState({ roomTypes: [], rooms: [], bookings: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getInventory(), getAdminBookings()])
      .then(([inventory, bookings]) => setData({ ...inventory, bookings }))
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  const availableRooms = data.rooms.filter((room) => room.status === 'available').length;
  const pendingBookings = data.bookings.filter((booking) => booking.status === 'pending').length;
  const activeBookings = data.bookings.filter((booking) => ['confirmed', 'checked_in'].includes(booking.status)).length;

  return (
    <main className="dashboard-page admin-dashboard">
      <section className="dashboard-welcome admin-welcome"><div><p className="eyebrow">Hotel administration</p><h1>Good day, {user.name.split(' ')[0]}.</h1><p>Monitor room inventory, pricing, reservations, and hotel operations.</p></div><span className="role-badge admin-badge">Administrator</span></section>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <section className="metric-grid"><article><span>Physical rooms</span><strong>{data.rooms.length}</strong><small>{availableRooms} currently available</small></article><article><span>Room types</span><strong>{data.roomTypes.length}</strong><small>Guest-facing categories</small></article><article><span>Pending bookings</span><strong>{pendingBookings}</strong><small>Awaiting confirmation</small></article><article><span>Active stays</span><strong>{activeBookings}</strong><small>Confirmed or checked in</small></article></section>
      <section className="admin-dashboard-grid">
        <div className="dashboard-panel"><div className="results-heading"><h2>Recent bookings</h2><Link className="text-link" to="/admin/bookings">Manage all -&gt;</Link></div>{data.bookings.slice(0, 5).map((booking) => <article className="recent-booking" key={booking.id}><div><strong>{booking.reference}</strong><span>{booking.guestName} - {booking.roomTypeName}</span></div><span className={`status-pill status-${booking.status}`}>{booking.status.replace('_', ' ')}</span></article>)}{data.bookings.length === 0 && <p className="panel-empty">No bookings have been created yet.</p>}</div>
        <div className="dashboard-panel quick-panel"><h2>Quick actions</h2><Link to="/admin/inventory"><span>Inventory</span><strong>Add or update rooms -&gt;</strong></Link><Link to="/admin/bookings"><span>Reservations</span><strong>View booking status -&gt;</strong></Link><Link to="/admin/users"><span>Team</span><strong>Manage staff access -&gt;</strong></Link><Link to="/profile"><span>Account</span><strong>View administrator profile -&gt;</strong></Link></div>
      </section>
    </main>
  );
}

function StaffBookingRow({ booking, actionLabel, nextStatus, onAction, isUpdating }) {
  return (
    <article className="front-desk-row">
      <div><strong>{booking.guestName}</strong><span>{booking.reference} - Room {booking.roomNumber}</span></div>
      <div><span>{booking.roomTypeName}</span><small>{booking.checkInTime} - {booking.checkOutTime} · {booking.guests} guest(s)</small></div>
      <button className="button button-primary button-small" disabled={isUpdating} onClick={() => onAction(booking.id, nextStatus)} type="button">{isUpdating ? 'Updating...' : actionLabel}</button>
    </article>
  );
}

function StaffDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const load = useCallback(() => getAdminBookings().then(setBookings), []);
  useEffect(() => { load().catch((requestError) => setError(getApiErrorMessage(requestError))); }, [load]);

  const pending = bookings.filter((booking) => booking.status === 'pending');
  const arrivals = bookings.filter((booking) => booking.status === 'confirmed' && booking.checkIn === today);
  const departures = bookings.filter((booking) => booking.status === 'checked_in' && booking.checkOut === today);
  const inHouse = bookings.filter((booking) => booking.status === 'checked_in');

  async function applyStatus(bookingId, status) {
    setUpdatingId(bookingId); setError('');
    try { await changeBookingStatus(bookingId, status, `Updated by front desk on ${today}`); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setUpdatingId(null); }
  }

  return (
    <main className="dashboard-page staff-dashboard">
      <section className="dashboard-welcome staff-welcome"><div><p className="eyebrow">Front desk operations</p><h1>Welcome, {user.name.split(' ')[0]}.</h1><p>Manage today's guest arrivals, departures, confirmations, and in-house stays.</p></div><div><span className="role-badge staff-badge">Hotel Staff</span><small className="dashboard-date">{today}</small></div></section>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <section className="metric-grid staff-metric-grid"><article><span>Today's arrivals</span><strong>{arrivals.length}</strong><small>Confirmed guests due in</small></article><article><span>Today's departures</span><strong>{departures.length}</strong><small>Checked-in guests due out</small></article><article><span>Pending confirmation</span><strong>{pending.length}</strong><small>Bookings needing attention</small></article><article><span>Currently in house</span><strong>{inHouse.length}</strong><small>Checked-in reservations</small></article></section>
      <section className="front-desk-grid">
        <div className="dashboard-panel"><div className="results-heading"><h2>Today's arrivals</h2><span>{arrivals.length}</span></div>{arrivals.map((booking) => <StaffBookingRow actionLabel="Check in" booking={booking} isUpdating={updatingId === booking.id} key={booking.id} nextStatus="checked_in" onAction={applyStatus} />)}{!arrivals.length && <p className="panel-empty">No confirmed arrivals scheduled for today.</p>}</div>
        <div className="dashboard-panel"><div className="results-heading"><h2>Today's departures</h2><span>{departures.length}</span></div>{departures.map((booking) => <StaffBookingRow actionLabel="Check out" booking={booking} isUpdating={updatingId === booking.id} key={booking.id} nextStatus="completed" onAction={applyStatus} />)}{!departures.length && <p className="panel-empty">No checked-in departures scheduled for today.</p>}</div>
        <div className="dashboard-panel pending-panel"><div className="results-heading"><h2>Pending confirmations</h2><Link className="text-link" to="/admin/bookings">View all -&gt;</Link></div>{pending.slice(0, 5).map((booking) => <StaffBookingRow actionLabel="Confirm" booking={booking} isUpdating={updatingId === booking.id} key={booking.id} nextStatus="confirmed" onAction={applyStatus} />)}{!pending.length && <p className="panel-empty">No bookings are waiting for confirmation.</p>}</div>
      </section>
    </main>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard user={user} />;
  if (user.role === 'staff') return <StaffDashboard user={user} />;
  return <GuestDashboard user={user} />;
}

export default DashboardPage;
