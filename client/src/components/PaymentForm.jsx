// Payment module — card payment form

import { useState } from 'react';
import { payForBooking } from '../api/paymentApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import { useNotifications } from '../context/notificationContext.js';

function PaymentForm({ booking, onCancel, onPaid }) {
  const { refresh: refreshNotifications } = useNotifications();
  const [form, setForm] = useState({ cardholder: '', cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const cardNumber = form.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber) || !/^\d{2}\/\d{2}$/.test(form.expiry) || !/^\d{3,4}$/.test(form.cvv)) {
      setError('Enter valid prototype card details.');
      return;
    }
    setError(''); setIsSubmitting(true);
    try {
      const token = cardNumber === '4000000000000002' ? 'tok_prototype_declined' : 'tok_prototype_approved';
      await payForBooking(booking.id, token);
      await refreshNotifications();
      onPaid();
    } catch (requestError) { await refreshNotifications(); setError(getApiErrorMessage(requestError)); }
    finally { setIsSubmitting(false); }
  }

  return (
    <form className="payment-form" onSubmit={submit}>
      <div className="payment-heading"><div><p className="eyebrow">Prototype gateway</p><h3>Secure payment</h3></div><strong>LKR {booking.totalAmount.toLocaleString()}</strong></div>
      <p className="payment-security">Card details stay in this browser form and are converted to a prototype gateway token. They are never sent to or stored by the hotel server.</p>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <label>Cardholder name<input autoComplete="cc-name" name="cardholder" onChange={update} required value={form.cardholder} /></label>
      <label>Card number<input autoComplete="cc-number" inputMode="numeric" maxLength="19" name="cardNumber" onChange={update} placeholder="4242 4242 4242 4242" required value={form.cardNumber} /></label>
      <div className="form-row"><label>Expiry<input autoComplete="cc-exp" maxLength="5" name="expiry" onChange={update} placeholder="12/30" required value={form.expiry} /></label><label>CVV<input autoComplete="cc-csc" inputMode="numeric" maxLength="4" name="cvv" onChange={update} required type="password" value={form.cvv} /></label></div>
      <small className="payment-test-help">Test success: 4242 4242 4242 4242 · Test decline: 4000 0000 0000 0002</small>
      <div className="payment-actions"><button className="button button-primary" disabled={isSubmitting} type="submit">{isSubmitting ? 'Processing...' : 'Pay and confirm booking'}</button><button className="button button-quiet" disabled={isSubmitting} onClick={onCancel} type="button">Pay later</button></div>
    </form>
  );
}

export default PaymentForm;
