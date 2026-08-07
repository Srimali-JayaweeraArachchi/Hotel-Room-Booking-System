import { useEffect, useState } from 'react';
import RoomCard from '../components/RoomCard.jsx';
import { searchRoomTypes } from '../api/roomApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';

const emptyFilters = { search: '', guests: '', minPrice: '', maxPrice: '' };

function RoomsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadRooms() {
      setIsLoading(true);
      setError('');
      try {
        const results = await searchRoomTypes(appliedFilters);
        if (active) setRoomTypes(results);
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadRooms();
    return () => { active = false; };
  }, [appliedFilters]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters(Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')));
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setAppliedFilters({});
  }

  return (
    <main className="rooms-page">
      <section className="rooms-heading">
        <p className="eyebrow">Rooms & suites</p>
        <h1>Choose your kind of comfort.</h1>
        <p>Explore rooms currently available for reservations. Date-specific availability will be confirmed during booking.</p>
      </section>

      <form className="room-search" onSubmit={handleSearch}>
        <label>Search<input name="search" onChange={updateFilter} placeholder="Deluxe, ocean, suite..." value={filters.search} /></label>
        <label>Guests<input min="1" name="guests" onChange={updateFilter} placeholder="2" type="number" value={filters.guests} /></label>
        <label>Minimum price<input min="0" name="minPrice" onChange={updateFilter} placeholder="10000" type="number" value={filters.minPrice} /></label>
        <label>Maximum price<input min="0" name="maxPrice" onChange={updateFilter} placeholder="40000" type="number" value={filters.maxPrice} /></label>
        <button className="button button-primary" type="submit">Search rooms</button>
        <button className="button button-quiet" onClick={clearFilters} type="button">Clear</button>
      </form>

      <section className="room-results" aria-live="polite">
        <div className="results-heading">
          <h2>Available room types</h2>
          <span>{roomTypes.length} results</span>
        </div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {isLoading ? (
          <div className="room-grid"><div className="room-skeleton" /><div className="room-skeleton" /></div>
        ) : roomTypes.length ? (
          <div className="room-grid">{roomTypes.map((roomType, index) => <RoomCard index={index} key={roomType.id} roomType={roomType} />)}</div>
        ) : (
          <div className="empty-state"><h2>No matching rooms</h2><p>Try changing the guest count or price range.</p></div>
        )}
      </section>
    </main>
  );
}

export default RoomsPage;
