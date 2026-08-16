import { useState } from 'react';
import { createReview, updateReview } from '../api/reviewApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function ReviewForm({ booking, onCancel, onSaved }) {
  const [form, setForm] = useState({
    rating: booking.reviewRating ?? 5,
    title: booking.reviewTitle ?? '',
    comment: booking.reviewComment ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (booking.reviewId) await updateReview(booking.reviewId, form);
      else await createReview(booking.id, form);
      await onSaved();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Verified stay</p>
        <h3>{booking.reviewId ? 'Edit your review' : 'Review your stay'}</h3>
      </div>
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      <fieldset className="rating-picker">
        <legend>Rating</legend>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating}>
            <input
              checked={Number(form.rating) === rating}
              name="rating"
              onChange={() => setForm({ ...form, rating })}
              type="radio"
              value={rating}
            />
            <span>{'★'.repeat(rating)}</span>
          </label>
        ))}
      </fieldset>
      <label>
        Review title
        <input
          maxLength="120"
          minLength="2"
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
          value={form.title}
        />
      </label>
      <label>
        Your feedback
        <textarea
          maxLength="1500"
          minLength="10"
          onChange={(event) =>
            setForm({ ...form, comment: event.target.value })
          }
          required
          rows="4"
          value={form.comment}
        />
      </label>
      <div className="review-actions">
        <button
          className="button button-primary button-small"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Saving...' : 'Publish review'}
        </button>
        <button
          className="button button-quiet"
          disabled={saving}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
