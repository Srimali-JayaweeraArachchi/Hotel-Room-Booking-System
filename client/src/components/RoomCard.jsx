import { Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel.jsx';

const roomThemes = ['room-art-sage', 'room-art-sand', 'room-art-blue'];

function formatPrice(value) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value);
}

function RoomCard({ roomType, index = 0 }) {
  return (
    <article className="room-card">
      <div className={`room-art ${roomThemes[index % roomThemes.length]} ${(roomType.images?.length || roomType.imageUrl) ? 'has-image' : ''}`}>
        <ImageCarousel compact images={roomType.images} legacyImageUrl={roomType.imageUrl} name={roomType.name} />
        <span>{roomType.availableRooms} available</span>
      </div>
      <div className="room-card-body">
        <div className="room-card-title">
          <h2>{roomType.name}</h2>
          <strong>{formatPrice(roomType.basePrice)}<small>/night</small></strong>
        </div>
        <p>{roomType.description}</p>
        <div className="room-meta">
          <span>Up to {roomType.capacity} guests</span>
          <span>{roomType.bedType}</span>
        </div>
        <Link className="text-link" to={`/rooms/${roomType.id}`}>View room details →</Link>
      </div>
    </article>
  );
}

export default RoomCard;
