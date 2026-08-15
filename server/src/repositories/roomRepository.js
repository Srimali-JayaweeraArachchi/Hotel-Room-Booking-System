import database from '../config/database.js';

function parseAmenities(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return JSON.parse(value);
}

function normalizeRoomType(row) {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    basePrice: Number(row.basePrice),
    capacity: Number(row.capacity),
    availableRooms: Number(row.availableRooms ?? 0),
    totalRooms: Number(row.totalRooms ?? 0),
    amenities: parseAmenities(row.amenities),
  };
}

function normalizeRoom(row) {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    roomTypeId: Number(row.roomTypeId),
    floor: Number(row.floor),
    ...(row.basePrice !== undefined && { basePrice: Number(row.basePrice) }),
  };
}

async function attachImages(roomTypes) {
  if (roomTypes.length === 0) return roomTypes;
  const placeholders = roomTypes.map(() => '?').join(',');
  const [rows] = await database.execute(
    `SELECT id, room_type_id AS roomTypeId,
       CASE WHEN image_data IS NOT NULL THEN CONCAT('/api/room-images/', id) ELSE image_url END AS imageUrl,
       alt_text AS altText, sort_order AS sortOrder
     FROM room_type_images WHERE room_type_id IN (${placeholders})
     ORDER BY sort_order ASC, id ASC`,
    roomTypes.map((roomType) => roomType.id),
  );
  const imagesByType = new Map();
  for (const row of rows) {
    const image = {
      ...row,
      id: Number(row.id),
      roomTypeId: Number(row.roomTypeId),
      sortOrder: Number(row.sortOrder),
    };
    const images = imagesByType.get(image.roomTypeId) ?? [];
    images.push(image);
    imagesByType.set(image.roomTypeId, images);
  }
  return roomTypes.map((roomType) => ({
    ...roomType,
    images: imagesByType.get(roomType.id) ?? [],
  }));
}

export async function findRoomTypes(filters = {}) {
  const conditions = [];
  const filterValues = [];

  if (filters.search) {
    conditions.push(
      '(rt.name LIKE ? OR rt.description LIKE ? OR rt.bed_type LIKE ?)',
    );
    const term = `%${filters.search}%`;
    filterValues.push(term, term, term);
  }
  if (filters.guests) {
    conditions.push('rt.capacity >= ?');
    filterValues.push(filters.guests);
  }
  if (filters.minPrice !== undefined) {
    conditions.push('rt.base_price >= ?');
    filterValues.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push('rt.base_price <= ?');
    filterValues.push(filters.maxPrice);
  }

  const availabilityValues = [];
  let availabilityCondition = "r.status = 'available'";
  if (filters.checkIn && filters.checkOut) {
    availabilityCondition += ` AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.room_id = r.id
        AND b.status IN ('pending', 'confirmed', 'checked_in')
        AND b.check_in < ? AND b.check_out > ?
    )`;
    availabilityValues.push(filters.checkOut, filters.checkIn);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const having = filters.availableOnly ? 'HAVING availableRooms > 0' : '';

  const [rows] = await database.execute(
    `SELECT
       rt.id, rt.name, rt.description, rt.base_price AS basePrice,
       rt.capacity, rt.bed_type AS bedType, rt.amenities,
       rt.image_url AS imageUrl,
       COUNT(r.id) AS totalRooms,
       SUM(CASE WHEN ${availabilityCondition} THEN 1 ELSE 0 END) AS availableRooms,
       rt.created_at AS createdAt, rt.updated_at AS updatedAt
     FROM room_types rt
     LEFT JOIN rooms r ON r.room_type_id = rt.id
     ${where}
     GROUP BY rt.id
     ${having}
     ORDER BY rt.base_price ASC, rt.name ASC`,
    [...availabilityValues, ...filterValues],
  );

  return attachImages(rows.map(normalizeRoomType));
}

export async function findRoomTypeById(id) {
  const [rows] = await database.execute(
    `SELECT
       rt.id, rt.name, rt.description, rt.base_price AS basePrice,
       rt.capacity, rt.bed_type AS bedType, rt.amenities,
       rt.image_url AS imageUrl,
       COUNT(r.id) AS totalRooms,
       SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) AS availableRooms,
       rt.created_at AS createdAt, rt.updated_at AS updatedAt
     FROM room_types rt
     LEFT JOIN rooms r ON r.room_type_id = rt.id
     WHERE rt.id = ?
     GROUP BY rt.id`,
    [id],
  );
  const roomType = normalizeRoomType(rows[0]);
  if (!roomType) return null;
  return (await attachImages([roomType]))[0];
}

export async function insertRoomTypeImages(roomTypeId, images) {
  if (images.length === 0) return [];
  const values = [];
  const placeholders = images.map((image, index) => {
    values.push(
      roomTypeId,
      image.imageData,
      image.mimeType,
      image.fileSize,
      image.contentHash,
      image.altText || null,
      index,
    );
    return '(?, NULL, ?, ?, ?, ?, ?, ?)';
  });
  await database.execute(
    `INSERT IGNORE INTO room_type_images (room_type_id, image_url, image_data, mime_type, file_size, content_hash, alt_text, sort_order)
     VALUES ${placeholders.join(',')}`,
    values,
  );
  return findRoomTypeImages(roomTypeId);
}

export async function findRoomTypeImageHashes(roomTypeId) {
  const [rows] = await database.execute(
    'SELECT content_hash AS contentHash FROM room_type_images WHERE room_type_id = ? AND content_hash IS NOT NULL',
    [roomTypeId],
  );
  return new Set(rows.map((row) => row.contentHash));
}

export async function findRoomTypeImages(roomTypeId) {
  const [rows] = await database.execute(
    `SELECT id, room_type_id AS roomTypeId,
       CASE WHEN image_data IS NOT NULL THEN CONCAT('/api/room-images/', id) ELSE image_url END AS imageUrl,
       alt_text AS altText, sort_order AS sortOrder
     FROM room_type_images WHERE room_type_id = ? ORDER BY sort_order ASC, id ASC`,
    [roomTypeId],
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    roomTypeId: Number(row.roomTypeId),
    sortOrder: Number(row.sortOrder),
  }));
}

export async function findRoomTypeImageById(id, roomTypeId) {
  const [rows] = await database.execute(
    'SELECT id, room_type_id AS roomTypeId, image_url AS imageUrl FROM room_type_images WHERE id = ? AND room_type_id = ? LIMIT 1',
    [id, roomTypeId],
  );
  return rows[0]
    ? {
        ...rows[0],
        id: Number(rows[0].id),
        roomTypeId: Number(rows[0].roomTypeId),
      }
    : null;
}

export async function findRoomTypeImageBinaryById(id) {
  const [rows] = await database.execute(
    'SELECT image_data AS imageData, mime_type AS mimeType, file_size AS fileSize FROM room_type_images WHERE id = ? AND image_data IS NOT NULL LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function deleteRoomTypeImageById(id, roomTypeId) {
  const [result] = await database.execute(
    'DELETE FROM room_type_images WHERE id = ? AND room_type_id = ?',
    [id, roomTypeId],
  );
  return result.affectedRows > 0;
}

export async function insertRoomType(data) {
  const [result] = await database.execute(
    `INSERT INTO room_types
       (name, description, base_price, capacity, bed_type, amenities, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description,
      data.basePrice,
      data.capacity,
      data.bedType,
      JSON.stringify(data.amenities),
      data.imageUrl || null,
    ],
  );
  return findRoomTypeById(result.insertId);
}

export async function updateRoomTypeById(id, data) {
  const [result] = await database.execute(
    `UPDATE room_types SET
       name = ?, description = ?, base_price = ?, capacity = ?,
       bed_type = ?, amenities = ?, image_url = ?
     WHERE id = ?`,
    [
      data.name,
      data.description,
      data.basePrice,
      data.capacity,
      data.bedType,
      JSON.stringify(data.amenities),
      data.imageUrl || null,
      id,
    ],
  );
  return result.affectedRows ? findRoomTypeById(id) : null;
}

export async function deleteRoomTypeById(id) {
  const [result] = await database.execute(
    'DELETE FROM room_types WHERE id = ?',
    [id],
  );
  return result.affectedRows > 0;
}

export async function findRooms(filters = {}) {
  const conditions = [];
  const values = [];
  if (filters.roomTypeId) {
    conditions.push('r.room_type_id = ?');
    values.push(filters.roomTypeId);
  }
  if (filters.status) {
    conditions.push('r.status = ?');
    values.push(filters.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await database.execute(
    `SELECT r.id, r.room_number AS roomNumber, r.room_type_id AS roomTypeId,
       rt.name AS roomTypeName, rt.base_price AS basePrice,
       r.floor, r.status, r.notes,
       r.created_at AS createdAt, r.updated_at AS updatedAt
     FROM rooms r
     JOIN room_types rt ON rt.id = r.room_type_id
     ${where}
     ORDER BY r.room_number ASC`,
    values,
  );
  return rows.map(normalizeRoom);
}

export async function findRoomById(id) {
  const [rows] = await database.execute(
    `SELECT r.id, r.room_number AS roomNumber, r.room_type_id AS roomTypeId,
       rt.name AS roomTypeName, rt.base_price AS basePrice,
       r.floor, r.status, r.notes,
       r.created_at AS createdAt, r.updated_at AS updatedAt
     FROM rooms r JOIN room_types rt ON rt.id = r.room_type_id
     WHERE r.id = ? LIMIT 1`,
    [id],
  );
  return normalizeRoom(rows[0]);
}

export async function insertRoom(data) {
  const [result] = await database.execute(
    `INSERT INTO rooms (room_number, room_type_id, floor, status, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.roomNumber,
      data.roomTypeId,
      data.floor,
      data.status,
      data.notes || null,
    ],
  );
  return findRoomById(result.insertId);
}

export async function updateRoomById(id, data) {
  const [result] = await database.execute(
    `UPDATE rooms SET room_number = ?, room_type_id = ?, floor = ?, status = ?, notes = ?
     WHERE id = ?`,
    [
      data.roomNumber,
      data.roomTypeId,
      data.floor,
      data.status,
      data.notes || null,
      id,
    ],
  );
  return result.affectedRows ? findRoomById(id) : null;
}

export async function deleteRoomById(id) {
  const [result] = await database.execute('DELETE FROM rooms WHERE id = ?', [
    id,
  ]);
  return result.affectedRows > 0;
}
