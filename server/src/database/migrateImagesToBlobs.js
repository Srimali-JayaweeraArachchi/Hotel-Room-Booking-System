import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import database from '../config/database.js';
import crypto from 'node:crypto';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(currentDirectory, '../../uploads/rooms');
const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

try {
  const [rows] = await database.execute(
    "SELECT id, image_url AS imageUrl FROM room_type_images WHERE image_data IS NULL AND image_url LIKE '/uploads/rooms/%'",
  );
  for (const row of rows) {
    const filename = path.basename(row.imageUrl);
    const filePath = path.join(uploadDirectory, filename);
    try {
      const imageData = await fs.readFile(filePath);
      const mimeType = mimeTypes[path.extname(filename).toLowerCase()] ?? 'application/octet-stream';
      await database.execute(
        'UPDATE room_type_images SET image_data = ?, mime_type = ?, file_size = ? WHERE id = ?',
        [imageData, mimeType, imageData.length, row.id],
      );
      console.log(`Migrated image ${row.id} to MySQL (${imageData.length} bytes)`);
    } catch (error) {
      if (error.code === 'ENOENT') console.warn(`Skipped missing local file for image ${row.id}: ${filename}`);
      else throw error;
    }
  }

  const [blobRows] = await database.execute(
    'SELECT id, room_type_id AS roomTypeId, image_data AS imageData FROM room_type_images WHERE image_data IS NOT NULL ORDER BY room_type_id, id',
  );
  const seenByRoomType = new Map();
  for (const row of blobRows) {
    const contentHash = crypto.createHash('sha256').update(row.imageData).digest('hex');
    const seen = seenByRoomType.get(row.roomTypeId) ?? new Set();
    if (seen.has(contentHash)) {
      await database.execute('DELETE FROM room_type_images WHERE id = ?', [row.id]);
      console.log(`Removed duplicate database image ${row.id}`);
      continue;
    }
    seen.add(contentHash);
    seenByRoomType.set(row.roomTypeId, seen);
    await database.execute('UPDATE room_type_images SET content_hash = ? WHERE id = ?', [contentHash, row.id]);
  }
} finally {
  await database.end();
}
