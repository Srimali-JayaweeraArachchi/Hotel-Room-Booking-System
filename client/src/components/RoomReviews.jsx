import { useEffect, useState } from 'react';
import { getRoomTypeReviews } from '../api/reviewApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function RoomReviews({ roomTypeId }) {
  const [data, setData] = useState({ reviews: [], reviewCount: 0, averageRating: 0 });
  const [error, setError] = useState('');
  useEffect(() => { getRoomTypeReviews(roomTypeId).then(setData).catch((requestError) => setError(getApiErrorMessage(requestError))); }, [roomTypeId]);
  return (
    <section className="room-reviews">
      <div className="review-section-heading"><div><p className="eyebrow">Verified guest feedback</p><h2>Room reviews</h2></div>{data.reviewCount > 0 && <div className="rating-summary"><strong>{data.averageRating}</strong><span>{'★'.repeat(Math.round(data.averageRating))}</span><small>{data.reviewCount} review{data.reviewCount === 1 ? '' : 's'}</small></div>}</div>
      {error && <div className="form-alert">{error}</div>}
      <div className="public-review-grid">{data.reviews.map((review) => <article key={review.id}><div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div><h3>{review.title}</h3><p>{review.comment}</p><footer><strong>{review.guestName}</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></footer></article>)}{!data.reviewCount && !error && <div className="empty-state"><h3>No reviews yet</h3><p>Verified guests can review this room after completing their stay.</p></div>}</div>
    </section>
  );
}

export default RoomReviews;
