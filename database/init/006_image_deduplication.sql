ALTER TABLE room_type_images
  ADD COLUMN content_hash CHAR(64) NULL AFTER file_size,
  ADD UNIQUE KEY uq_room_image_content (room_type_id, content_hash);