import { useEffect, useState } from 'react';
import { deleteRoom, deleteRoomImage, deleteRoomType, getInventory, saveRoom, saveRoomType, uploadRoomImages } from '../api/roomApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import { resolveMediaUrl } from '../utils/mediaUrl.js';
import SelectedImagePreviews from '../components/SelectedImagePreviews.jsx';

const emptyType = { name: '', description: '', basePrice: '', capacity: '', bedType: '', amenities: '' };
const emptyRoom = { roomNumber: '', roomTypeId: '', floor: '1', status: 'available', notes: '' };

function AdminInventoryPage() {
  const [inventory, setInventory] = useState({ roomTypes: [], rooms: [] });
  const [typeForm, setTypeForm] = useState(emptyType);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSavingType, setIsSavingType] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refresh() { setInventory(await getInventory()); }
  useEffect(() => { refresh().catch((requestError) => setError(getApiErrorMessage(requestError))); }, []);

  function update(setter) { return (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function notify(text) { setError(''); setMessage(text); }
  function fail(requestError) { setMessage(''); setError(getApiErrorMessage(requestError)); }

  async function submitType(event) {
    event.preventDefault();
    if (isSavingType) return;
    setIsSavingType(true);
    try {
      const savedType = await saveRoomType({ ...typeForm, amenities: typeForm.amenities.split(',').map((item) => item.trim()).filter(Boolean) });
      if (selectedImages.length) await uploadRoomImages(savedType.id, selectedImages);
      setTypeForm(emptyType); setSelectedImages([]); await refresh(); notify(`Room type saved${selectedImages.length ? ` with ${selectedImages.length} image(s)` : ''}.`);
    } catch (requestError) { fail(requestError); }
    finally { setIsSavingType(false); }
  }

  async function submitRoom(event) {
    event.preventDefault();
    try { await saveRoom(roomForm); setRoomForm(emptyRoom); await refresh(); notify('Room saved successfully.'); }
    catch (requestError) { fail(requestError); }
  }

  function editType(type) { setTypeForm({ id: type.id, name: type.name, description: type.description, basePrice: type.basePrice, capacity: type.capacity, bedType: type.bedType, amenities: type.amenities.join(', ') }); setSelectedImages([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function editRoom(room) { setRoomForm({ ...room, notes: room.notes ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function selectTypeImages(event) {
    const seen = new Set();
    const files = Array.from(event.target.files).filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (files.length > 10) { fail({ response: { data: { message: 'Select a maximum of 10 images.' } } }); event.target.value = ''; return; }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) { fail({ response: { data: { message: 'Each image must be 5 MB or smaller.' } } }); event.target.value = ''; return; }
    setError(''); setSelectedImages(files);
  }
  function removeSelectedImage(index) { setSelectedImages((files) => files.filter((_, fileIndex) => fileIndex !== index)); }

  async function removeType(type) {
    if (type.totalRooms > 0) { fail({ response: { data: { message: `Cannot delete ${type.name}. Delete its ${type.totalRooms} physical room(s) first.` } } }); return; }
    if (!window.confirm('Delete this room type and all its images?')) return;
    try { await deleteRoomType(type.id); await refresh(); notify('Room type deleted.'); } catch (requestError) { fail(requestError); }
  }
  async function removePhysicalRoom(id) { if (!window.confirm('Delete this physical room?')) return; try { await deleteRoom(id); await refresh(); notify('Room deleted.'); } catch (requestError) { fail(requestError); } }
  async function removeImage(typeId, imageId) { if (!window.confirm('Remove this image?')) return; try { await deleteRoomImage(typeId, imageId); await refresh(); notify('Image removed.'); } catch (requestError) { fail(requestError); } }

  return (
    <main className="admin-page">
      <section className="admin-heading"><div><p className="eyebrow">Administration</p><h1>Room inventory</h1><p>Manage guest-facing room types, prices, physical rooms, and operational availability.</p></div><div className="inventory-summary"><strong>{inventory.rooms.length}</strong><span>physical rooms</span><strong>{inventory.roomTypes.length}</strong><span>room types</span></div></section>
      {message && <div className="success-alert" role="status">{message}</div>}{error && <div className="form-alert" role="alert">{error}</div>}

      <section className="admin-forms">
        <form className="admin-form" onSubmit={submitType}><div className="form-title"><h2>{typeForm.id ? 'Edit room type' : 'Add room type'}</h2>{typeForm.id && <button className="button button-quiet" onClick={() => { setTypeForm(emptyType); setSelectedImages([]); }} type="button">Cancel edit</button>}</div>
          <label>Name<input name="name" onChange={update(setTypeForm)} required value={typeForm.name} /></label>
          <label>Description<textarea name="description" onChange={update(setTypeForm)} required rows="3" value={typeForm.description} /></label>
          <div className="form-row"><label>Price per night<input min="0" name="basePrice" onChange={update(setTypeForm)} required type="number" value={typeForm.basePrice} /></label><label>Capacity<input min="1" name="capacity" onChange={update(setTypeForm)} required type="number" value={typeForm.capacity} /></label></div>
          <label>Bed type<input name="bedType" onChange={update(setTypeForm)} required value={typeForm.bedType} /></label>
          <label>Amenities (comma separated)<input name="amenities" onChange={update(setTypeForm)} placeholder="Wi-Fi, Breakfast, Ocean view" required value={typeForm.amenities} /></label>
          <label>Room images<input accept="image/jpeg,image/png,image/webp" className="file-input" multiple onChange={selectTypeImages} type="file" /></label>
          <p className="selected-files">{selectedImages.length ? `${selectedImages.length} image(s) selected: ${selectedImages.map((file) => file.name).join(', ')}` : 'Select one or more JPG, PNG, or WebP images (maximum 10).'}</p>
          <SelectedImagePreviews files={selectedImages} onRemove={removeSelectedImage} />
          <button className="button button-primary" disabled={isSavingType} type="submit">{isSavingType ? 'Saving room and images...' : 'Save room type'}</button>
        </form>

        <form className="admin-form" onSubmit={submitRoom}><div className="form-title"><h2>{roomForm.id ? 'Edit physical room' : 'Add physical room'}</h2>{roomForm.id && <button className="button button-quiet" onClick={() => setRoomForm(emptyRoom)} type="button">Cancel edit</button>}</div>
          <div className="form-row"><label>Room number<input name="roomNumber" onChange={update(setRoomForm)} required value={roomForm.roomNumber} /></label><label>Floor<input name="floor" onChange={update(setRoomForm)} required type="number" value={roomForm.floor} /></label></div>
          <label>Room type<select name="roomTypeId" onChange={update(setRoomForm)} required value={roomForm.roomTypeId}><option value="">Select room type</option>{inventory.roomTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
          <label>Status<select name="status" onChange={update(setRoomForm)} value={roomForm.status}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label>
          <label>Notes<textarea name="notes" onChange={update(setRoomForm)} rows="3" value={roomForm.notes} /></label>
          <button className="button button-primary" type="submit">Save physical room</button>
        </form>
      </section>

      <section className="inventory-section"><div className="results-heading"><h2>Room types</h2><span>{inventory.roomTypes.length} types</span></div><div className="inventory-cards">{inventory.roomTypes.map((type) => <article key={type.id}><div><h3>{type.name}</h3><p>LKR {type.basePrice.toLocaleString()} · {type.capacity} guests · {type.availableRooms}/{type.totalRooms} available</p><div className="admin-image-strip">{type.images?.map((image) => <div key={image.id}><img alt={image.altText || type.name} src={resolveMediaUrl(image.imageUrl)} /><button aria-label="Remove image" onClick={() => removeImage(type.id, image.id)} type="button">×</button></div>)}</div><small className="upload-help">Use Edit to add more images. JPG, PNG or WebP · max 5MB each · up to 10.</small>{type.totalRooms > 0 && <small className="delete-help">Delete its physical room(s) before deleting this room type.</small>}</div><div><button className="table-action" onClick={() => editType(type)} type="button">Edit</button><button className="table-action danger" disabled={type.totalRooms > 0} onClick={() => removeType(type)} title={type.totalRooms > 0 ? 'Delete assigned physical rooms first' : 'Delete room type'} type="button">Delete</button></div></article>)}</div></section>
      <section className="inventory-section"><div className="results-heading"><h2>Physical rooms</h2><span>{inventory.rooms.length} rooms</span></div><div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Status</th><th>Actions</th></tr></thead><tbody>{inventory.rooms.map((room) => <tr key={room.id}><td>{room.roomNumber}</td><td>{room.roomTypeName}</td><td>{room.floor}</td><td><span className={`status-pill status-${room.status}`}>{room.status}</span></td><td><button className="table-action" onClick={() => editRoom(room)} type="button">Edit</button><button className="table-action danger" onClick={() => removePhysicalRoom(room.id)} type="button">Delete</button></td></tr>)}</tbody></table></div></section>
    </main>
  );
}

export default AdminInventoryPage;
