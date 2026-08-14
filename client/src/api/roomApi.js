import httpClient from './httpClient.js';

export async function searchRoomTypes(filters = {}) {
  const response = await httpClient.get('/rooms', { params: filters });
  return response.data.data.roomTypes;
}

export async function getRoomType(id) {
  const response = await httpClient.get(`/rooms/${id}`);
  return response.data.data.roomType;
}

export async function getInventory() {
  const [typesResponse, roomsResponse] = await Promise.all([
    httpClient.get('/admin/inventory/room-types'),
    httpClient.get('/admin/inventory/rooms'),
  ]);
  return {
    roomTypes: typesResponse.data.data.roomTypes,
    rooms: roomsResponse.data.data.rooms,
  };
}

export async function saveRoomType(roomType) {
  const payload = {
    name: roomType.name,
    description: roomType.description,
    basePrice: roomType.basePrice,
    capacity: roomType.capacity,
    bedType: roomType.bedType,
    amenities: roomType.amenities,
  };
  const response = roomType.id
    ? await httpClient.put(`/admin/inventory/room-types/${roomType.id}`, payload)
    : await httpClient.post('/admin/inventory/room-types', payload);
  return response.data.data.roomType;
}

export async function deleteRoomType(id) {
  await httpClient.delete(`/admin/inventory/room-types/${id}`);
}

export async function saveRoom(room) {
  const payload = {
    roomNumber: room.roomNumber,
    roomTypeId: room.roomTypeId,
    floor: room.floor,
    status: room.status,
    notes: room.notes ?? '',
  };
  const response = room.id
    ? await httpClient.put(`/admin/inventory/rooms/${room.id}`, payload)
    : await httpClient.post('/admin/inventory/rooms', payload);
  return response.data.data.room;
}

export async function deleteRoom(id) {
  await httpClient.delete(`/admin/inventory/rooms/${id}`);
}

export async function uploadRoomImages(roomTypeId, files) {
  const formData = new FormData();
  for (const file of files) formData.append('images', file);
  const response = await httpClient.post(`/admin/inventory/room-types/${roomTypeId}/images`, formData);
  return response.data.data.roomType;
}

export async function deleteRoomImage(roomTypeId, imageId) {
  const response = await httpClient.delete(`/admin/inventory/room-types/${roomTypeId}/images/${imageId}`);
  return response.data.data.roomType;
}
