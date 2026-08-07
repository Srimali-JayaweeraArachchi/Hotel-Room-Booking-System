CREATE TABLE IF NOT EXISTS room_type_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_type_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  alt_text VARCHAR(255) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_room_images_type_order (room_type_id, sort_order, id),
  CONSTRAINT fk_room_images_room_type
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO room_type_images (room_type_id, image_url, alt_text, sort_order)
SELECT id, image_url, CONCAT(name, ' room image'), 0
FROM room_types rt
WHERE rt.image_url IS NOT NULL AND rt.image_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM room_type_images rti WHERE rti.room_type_id = rt.id
  );
