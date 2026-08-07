ALTER TABLE room_type_images
  MODIFY image_url VARCHAR(1000) NULL,
  ADD COLUMN image_data LONGBLOB NULL AFTER image_url,
  ADD COLUMN mime_type VARCHAR(100) NULL AFTER image_data,
  ADD COLUMN file_size INT UNSIGNED NULL AFTER mime_type;
