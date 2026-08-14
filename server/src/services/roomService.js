import {
  deleteRoomTypeImageById,
  deleteRoomById,
  deleteRoomTypeById,
  findRoomById,
  findRooms,
  findRoomTypeById,
  findRoomTypeImageById,
  findRoomTypeImageBinaryById,
  findRoomTypeImageHashes,
  findRoomTypes,
  insertRoom,
  insertRoomType,
  insertRoomTypeImages,
  updateRoomById,
  updateRoomTypeById,
} from '../repositories/roomRepository.js';
import { AppError } from '../utils/AppError.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { roomUploadDirectory } from '../middleware/roomImageUpload.js';

function translateDatabaseError(error) {
  if (error.code === 'ER_DUP_ENTRY') {
    throw new AppError(409, 'A room or room type with this value already exists');
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError(400, 'The selected room type does not exist');
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    throw new AppError(409, 'Delete the rooms assigned to this room type first');
  }
  throw error;
}

export function listPublicRoomTypes(filters) {
  return findRoomTypes({ ...filters, availableOnly: true });
}

export async function getPublicRoomType(id) {
  const roomType = await findRoomTypeById(id);
  if (!roomType || roomType.availableRooms < 1) {
    throw new AppError(404, 'Room type not found or currently unavailable');
  }
  return roomType;
}

export function listInventoryRoomTypes() {
  return findRoomTypes({ availableOnly: false });
}

export function listInventoryRooms(filters) {
  return findRooms(filters);
}

export async function createRoomType(data) {
  try { return await insertRoomType(data); } catch (error) { return translateDatabaseError(error); }
}

export async function updateRoomType(id, data) {
  try {
    const roomType = await updateRoomTypeById(id, data);
    if (!roomType) throw new AppError(404, 'Room type not found');
    return roomType;
  } catch (error) { return translateDatabaseError(error); }
}

export async function removeRoomType(id) {
  try {
    if (!(await deleteRoomTypeById(id))) throw new AppError(404, 'Room type not found');
  } catch (error) { translateDatabaseError(error); }
}

export async function createRoom(data) {
  try { return await insertRoom(data); } catch (error) { return translateDatabaseError(error); }
}

export async function updateRoom(id, data) {
  try {
    const room = await updateRoomById(id, data);
    if (!room) throw new AppError(404, 'Room not found');
    return room;
  } catch (error) { return translateDatabaseError(error); }
}

export async function removeRoom(id) {
  if (!(await deleteRoomById(id))) throw new AppError(404, 'Room not found');
}

export async function getInventoryRoom(id) {
  const room = await findRoomById(id);
  if (!room) throw new AppError(404, 'Room not found');
  return room;
}

export async function addRoomTypeImages(roomTypeId, files) {
  const roomType = await findRoomTypeById(roomTypeId);
  if (!roomType) throw new AppError(404, 'Room type not found');
  if (!files?.length) throw new AppError(400, 'Select at least one room image');
  const existingHashes = await findRoomTypeImageHashes(roomTypeId);
  const requestHashes = new Set();
  const uniqueFiles = files
    .map((file) => ({
      file,
      contentHash: crypto.createHash('sha256').update(file.buffer).digest('hex'),
    }))
    .filter(({ contentHash }) => {
      if (existingHashes.has(contentHash) || requestHashes.has(contentHash)) return false;
      requestHashes.add(contentHash);
      return true;
    });
  const existingCount = roomType.images.length;
  if (existingCount + uniqueFiles.length > 10) {
    throw new AppError(400, 'A room type can contain a maximum of 10 images');
  }
  await insertRoomTypeImages(roomTypeId, uniqueFiles.map(({ file, contentHash }) => ({
    imageData: file.buffer,
    mimeType: file.mimetype,
    fileSize: file.size,
    contentHash,
    altText: `${roomType.name} room image`,
  })));
  return findRoomTypeById(roomTypeId);
}

export async function getRoomTypeImageBinary(imageId) {
  const image = await findRoomTypeImageBinaryById(imageId);
  if (!image) throw new AppError(404, 'Room image not found');
  return image;
}

export async function removeRoomTypeImage(roomTypeId, imageId) {
  const image = await findRoomTypeImageById(imageId, roomTypeId);
  if (!image) throw new AppError(404, 'Room image not found');
  await deleteRoomTypeImageById(imageId, roomTypeId);
  if (image.imageUrl?.startsWith('/uploads/rooms/')) {
    const filename = path.basename(image.imageUrl);
    await fs.unlink(path.join(roomUploadDirectory, filename)).catch(() => {});
  }
  return findRoomTypeById(roomTypeId);
}
