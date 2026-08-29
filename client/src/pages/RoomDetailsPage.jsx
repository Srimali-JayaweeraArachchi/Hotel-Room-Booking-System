import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRoomType } from '../api/roomApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import BookingForm from '../components/BookingForm.jsx';
import ImageCarousel from '../components/ImageCarousel.jsx';
import RoomReviews from '../components/RoomReviews.jsx';

function formatPrice(value) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value);
}

function RoomDetailsPage() {
  const { id } = useParams();
  const [roomType, setRoomType] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getRoomType(id)
      .then((data) => active && setRoomType(data))
      .catch(
        (requestError) => active && setError(getApiErrorMessage(requestError)),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error)
    return (
      <main className="centered-state">
        <h1>Room unavailable</h1>
        <p>{error}</p>
        <Link className="button button-primary" to="/rooms">
          Back to rooms
        </Link>
      </main>
    );
  if (!roomType)
    return (
      <main className="centered-state">
        <span className="spinner" />
        <p>Loading room details...</p>
      </main>
    );

  return (
    <main className="room-detail-page">
      <Link className="back-link" to="/rooms">
        ← All rooms
      </Link>
      <section className="room-detail-hero">
        <div
          className={`room-detail-art ${roomType.images?.length || roomType.imageUrl ? 'has-image' : ''}`}
        >
          <ImageCarousel
            images={roomType.images}
            legacyImageUrl={roomType.imageUrl}
            name={roomType.name}
          />
          <span>{roomType.availableRooms} rooms currently available</span>
        </div>
        <div className="room-detail-copy">
          <p className="eyebrow">Room type</p>
          <h1>{roomType.name}</h1>
          <p>{roomType.description}</p>
          <div className="detail-price">
            <strong>{formatPrice(roomType.basePrice)}</strong>
            <span>per night</span>
          </div>
          <dl className="detail-specs">
            <div>
              <dt>Guests</dt>
              <dd>Up to {roomType.capacity}</dd>
            </div>
            <div>
              <dt>Bed</dt>
              <dd>{roomType.bedType}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="detail-lower">
        <div className="amenities-section">
          <p className="eyebrow">Included</p>
          <h2>Room amenities</h2>
          <div className="amenity-grid">
            {roomType.amenities.map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))}
          </div>
        </div>
        <BookingForm roomType={roomType} />
      </section>
      <RoomReviews roomTypeId={roomType.id} />
    </main>
  );
}

export default RoomDetailsPage;
