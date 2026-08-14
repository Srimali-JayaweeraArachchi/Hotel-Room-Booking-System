import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReviews } from '../api/reviewApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { getMyReviews().then(setReviews).catch((requestError) => setError(getApiErrorMessage(requestError))); }, []);

  return (
    <main className="my-reviews-page">
      <section className="rooms-heading"><p className="eyebrow">Guest feedback</p><h1>My reviews</h1><p>View every verified-stay review you have published.</p></section>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <section className="my-review-list">
        {reviews.map((review) => <article className="my-review-card" key={review.id}><header><div><p className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><h2>{review.title}</h2></div><span>{new Date(review.createdAt).toLocaleDateString()}</span></header><p>{review.comment}</p><footer><div><strong>{review.roomTypeName}</strong><small>Booking {review.bookingReference}</small></div><Link className="text-link" to={`/rooms/${review.roomTypeId}`}>View room →</Link></footer></article>)}
        {!reviews.length && !error && <div className="empty-state"><h2>No reviews yet</h2><p>After a paid stay is completed, you can publish a review from My Bookings.</p><Link className="button button-primary" to="/bookings">View bookings</Link></div>}
      </section>
    </main>
  );
}

export default MyReviewsPage;
