import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const roomUploadDirectory = path.resolve(
  currentDirectory,
  '../../uploads/rooms',
);
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadRoomImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter(_request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      callback(
        new AppError(400, 'Only JPG, PNG, and WebP room images are allowed'),
      );
      return;
    }
    callback(null, true);
  },
}).array('images', 10);
