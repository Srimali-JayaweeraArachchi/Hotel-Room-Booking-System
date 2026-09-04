import { useEffect, useState } from 'react';
import { changeBookingStatus, getAdminBookings } from '../api/bookingApi.js';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';

const transitions = { pending: ['confirmed', 'cancelled'], confirmed: ['checked_in', 'cancelled'], checked_in: ['completed'], completed: [], cancelled: [] };
const pageSize = 8;

function availableTransitions(booking) {
  return transitions[booking.status].filter(
    (status) => !(status === 'cancelled' && booking.paymentStatus === 'succeeded'),
  );
}

function PaymentStatus({ booking }) {
  const status = booking.paymentStatus ?? 'unpaid';
  return (
    <div>
      <span className={`status-pill payment-${status}`}>{status}</span>
      {booking.paymentReference && <small className="table-subtext">{booking.paymentReference}</small>}
    </div>
  );
}

function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const visibleBookings = bookings.slice((page - 1) * pageSize, page * pageSize);

  async function load(nextFilters = filters) {
    const activeFilters = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
    setBookings(await getAdminBookings(activeFilters));
  }

  useEffect(() => {
    getAdminBookings().then(setBookings).catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  async function submit(event) {
    event.preventDefault();
    try { await load(); setPage(1); setError(''); } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function setStatus(id, status) {
    try { await changeBookingStatus(id, status); await load(); setError(''); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  return (
    <main className="admin-page">
      <section className="admin-heading"><div><p className="eyebrow">{user.role === 'staff' ? 'Front desk' : 'Administration'}</p><h1>{user.role === 'staff' ? 'Booking operations' : 'Booking overview'}</h1><p>{user.role === 'staff' ? 'Find guests, verify payment, confirm reservations, and process daily check-in and check-out.' : 'View booking and payment status. Operational status changes are handled by front desk staff.'}</p></div></section>
      <form className="booking-admin-search" onSubmit={submit}><input onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Reference, guest, email or room" value={filters.search} /><select onChange={(event) => setFilters({ ...filters, status: event.target.value })} value={filters.status}><option value="">All statuses</option>{Object.keys(transitions).map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select><button className="button button-primary" type="submit">Filter</button></form>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Reference</th><th>Booked at</th><th>Guest</th><th>Room</th><th>Stay</th><th>Total</th><th>Payment</th><th>{user.role === 'staff' ? 'Status/action' : 'Status'}</th></tr></thead><tbody>
        {visibleBookings.map((booking) => {
          const nextStatuses = availableTransitions(booking);
          return <tr key={booking.id}><td>{booking.reference}</td><td>{new Date(booking.createdAt).toLocaleDateString()}<small className="table-subtext">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td><td>{booking.guestName}<small className="table-subtext">{booking.guestEmail}</small></td><td>{booking.roomTypeName}<small className="table-subtext">Room {booking.roomNumber}</small></td><td>{booking.checkIn} · {booking.checkInTime}<small className="table-subtext">to {booking.checkOut} · {booking.checkOutTime}</small></td><td>LKR {booking.totalAmount.toLocaleString()}</td><td><PaymentStatus booking={booking} /></td><td><span className={`status-pill status-${booking.status}`}>{booking.status.replace('_', ' ')}</span>{user.role === 'staff' && nextStatuses.length > 0 && <select className="status-select" defaultValue="" onChange={(event) => { if (event.target.value) setStatus(booking.id, event.target.value); }}><option value="">Change...</option>{nextStatuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select>}{user.role === 'staff' && booking.paymentStatus === 'succeeded' && booking.status === 'confirmed' && <small className="paid-lock-help">Paid booking: staff cancellation locked</small>}</td></tr>;
        })}
      </tbody></table></div>
      <nav aria-label="Booking table pagination" className="table-pagination"><span>Showing {bookings.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, bookings.length)} of {bookings.length}</span><div><button className="button button-secondary button-small" disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button><strong>Page {page} of {totalPages}</strong><button className="button button-secondary button-small" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} type="button">Next</button></div></nav>
    </main>
  );
}

export default AdminBookingsPage;
