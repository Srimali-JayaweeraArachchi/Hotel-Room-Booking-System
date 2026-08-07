import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelBooking, getMyBookings, updateBooking } from '../api/bookingApi.js';
import PaymentForm from '../components/PaymentForm.jsx';
import { getApiErrorMessage } from '../utils/apiError.js';
import { useNotifications } from '../context/notificationContext.js';
import ReviewForm from '../components/ReviewForm.jsx';
import { deleteReview } from '../api/reviewApi.js';

function formatPrice(value) { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(value); }

function MyBookingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh: refreshNotifications } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payingId, setPayingId] = useState(location.state?.payBookingId ?? null);
  const [reviewingId, setReviewingId] = useState(null);

  async function refresh() { setBookings(await getMyBookings()); }
  useEffect(() => { refresh().catch((requestError) => setError(getApiErrorMessage(requestError))); }, []);
  function startEdit(booking) { setEditing({ id: booking.id, checkIn: booking.checkIn, checkInTime: booking.checkInTime, checkOut: booking.checkOut, checkOutTime: booking.checkOutTime, guests: booking.guests, specialRequests: booking.specialRequests ?? '' }); }
  async function saveEdit(event) { event.preventDefault(); try { await updateBooking(editing.id, editing); setEditing(null); await refresh(); setMessage('Booking updated.'); setError(''); } catch (requestError) { setError(getApiErrorMessage(requestError)); } }
  async function cancel(id) { if (!window.confirm('Cancel this booking?')) return; try { await cancelBooking(id); await Promise.all([refresh(), refreshNotifications()]); setMessage('Booking cancelled.'); setError(''); } catch (requestError) { setError(getApiErrorMessage(requestError)); } }
  async function paymentComplete() { setPayingId(null); await refresh(); setMessage('Payment successful. Your booking is confirmed.'); setError(''); navigate('/bookings', { replace: true, state: {} }); }
  async function reviewSaved() { setReviewingId(null); await Promise.all([refresh(), refreshNotifications()]); setMessage('Your review has been published.'); setError(''); }
  async function removeReview(reviewId) { if (!window.confirm('Delete this review?')) return; try { await deleteReview(reviewId); await refresh(); setMessage('Review deleted.'); setError(''); } catch (requestError) { setError(getApiErrorMessage(requestError)); } }

  return (
    <main className="bookings-page"><section className="rooms-heading"><p className="eyebrow">Guest reservations</p><h1>My bookings</h1><p>Review upcoming stays, update reservation details, or cancel eligible bookings.</p></section>
      {message && <div className="success-alert">{message}</div>}{error && <div className="form-alert">{error}</div>}
      <div className="booking-list">{bookings.length ? bookings.map((booking) => <article className="booking-card" key={booking.id}><div className="booking-reference"><span>{booking.reference}</span><div className="booking-statuses">{booking.paymentStatus && <strong className={`status-pill payment-${booking.paymentStatus}`}>payment {booking.paymentStatus}</strong>}<strong className={`status-pill status-${booking.status}`}>{booking.status.replace('_', ' ')}</strong></div></div><div className="booking-main"><div><h2>{booking.roomTypeName}</h2><p>Room {booking.roomNumber}</p></div><div className="booking-dates"><span>Check-in<strong>{booking.checkIn} · {booking.checkInTime}</strong></span><span>Check-out<strong>{booking.checkOut} · {booking.checkOutTime}</strong></span><span>Guests<strong>{booking.guests}</strong></span></div><strong className="booking-total">{formatPrice(booking.totalAmount)}</strong></div>
        {payingId === booking.id && booking.status === 'pending' ? <PaymentForm booking={booking} onCancel={() => setPayingId(null)} onPaid={paymentComplete} /> : editing?.id === booking.id ? <form className="booking-edit" onSubmit={saveEdit}><div className="form-row"><label>Check-in date<input name="checkIn" onChange={(e) => setEditing({ ...editing, checkIn: e.target.value })} required type="date" value={editing.checkIn} /></label><label>Check-in time<input name="checkInTime" onChange={(e) => setEditing({ ...editing, checkInTime: e.target.value })} required type="time" value={editing.checkInTime} /></label><label>Check-out date<input name="checkOut" onChange={(e) => setEditing({ ...editing, checkOut: e.target.value })} required type="date" value={editing.checkOut} /></label><label>Check-out time<input name="checkOutTime" onChange={(e) => setEditing({ ...editing, checkOutTime: e.target.value })} required type="time" value={editing.checkOutTime} /></label><label>Guests<input min="1" name="guests" onChange={(e) => setEditing({ ...editing, guests: e.target.value })} required type="number" value={editing.guests} /></label></div><label>Special requests<textarea onChange={(e) => setEditing({ ...editing, specialRequests: e.target.value })} value={editing.specialRequests} /></label><div><button className="button button-primary button-small" type="submit">Save changes</button><button className="button button-quiet" onClick={() => setEditing(null)} type="button">Cancel edit</button></div></form> : ['pending', 'confirmed'].includes(booking.status) && <div className="booking-actions">{booking.status === 'pending' && <><button className="button button-primary button-small" onClick={() => setPayingId(booking.id)} type="button">Pay now</button><button className="table-action" onClick={() => startEdit(booking)} type="button">Modify</button></>}<button className="table-action danger" onClick={() => cancel(booking.id)} type="button">{booking.status === 'confirmed' ? 'Cancel and refund' : 'Cancel booking'}</button></div>}
        {booking.status === 'completed' && booking.paymentStatus === 'succeeded' && (reviewingId === booking.id ? <ReviewForm booking={booking} onCancel={() => setReviewingId(null)} onSaved={reviewSaved} /> : booking.reviewId ? <div className="submitted-review"><div><span className="review-stars">{'★'.repeat(booking.reviewRating)}{'☆'.repeat(5 - booking.reviewRating)}</span><strong>{booking.reviewTitle}</strong><p>{booking.reviewComment}</p></div><div><button className="table-action" onClick={() => setReviewingId(booking.id)} type="button">Edit review</button><button className="table-action danger" onClick={() => removeReview(booking.reviewId)} type="button">Delete review</button></div></div> : <div className="booking-actions"><button className="button button-secondary button-small" onClick={() => setReviewingId(booking.id)} type="button">Write a review</button></div>)}
      </article>) : <div className="empty-state"><h2>No bookings yet</h2><p>Your reservations will appear here after you select a room.</p></div>}</div>
    </main>
  );
}

export default MyBookingsPage;
