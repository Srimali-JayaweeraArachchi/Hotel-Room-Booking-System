import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../api/bookingApi.js';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import { useNotifications } from '../context/notificationContext.js';

function nextDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function BookingForm({ roomType }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh: refreshNotifications } = useNotifications();
  const [form, setForm] = useState({ checkIn: nextDate(1), checkInTime: '14:00', checkOut: nextDate(2), checkOutTime: '11:00', guests: '1', specialRequests: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
    setError(''); setIsSubmitting(true);
    try { const booking = await createBooking({ ...form, roomTypeId: roomType.id }); await refreshNotifications(); navigate('/bookings', { state: { created: true, payBookingId: booking.id } }); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setIsSubmitting(false); }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <h2>Reserve this room</h2>
      <p>Your room will be held as pending until secure payment confirms the reservation.</p>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <div className="form-row"><label>Check-in date<input min={nextDate(0)} name="checkIn" onChange={update} required type="date" value={form.checkIn} /></label><label>Check-in time<input name="checkInTime" onChange={update} required type="time" value={form.checkInTime} /></label><label>Check-out date<input min={form.checkIn} name="checkOut" onChange={update} required type="date" value={form.checkOut} /></label><label>Check-out time<input name="checkOutTime" onChange={update} required type="time" value={form.checkOutTime} /></label></div>
      <label>Guests<input max={roomType.capacity} min="1" name="guests" onChange={update} required type="number" value={form.guests} /></label>
      <label>Special requests<textarea name="specialRequests" onChange={update} placeholder="Optional requests for your stay" rows="3" value={form.specialRequests} /></label>
      <button className="button button-primary button-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Creating booking...' : isAuthenticated ? 'Continue to payment' : 'Log in to book'}</button>
    </form>
  );
}

export default BookingForm;
