CREATE TABLE IF NOT EXISTS room_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  capacity SMALLINT UNSIGNED NOT NULL,
  bed_type VARCHAR(80) NOT NULL,
  amenities JSON NOT NULL,
  image_url VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_room_types_name (name),
  CONSTRAINT chk_room_types_price CHECK (base_price >= 0),
  CONSTRAINT chk_room_types_capacity CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_number VARCHAR(20) NOT NULL,
  room_type_id BIGINT UNSIGNED NOT NULL,
  floor SMALLINT NOT NULL DEFAULT 1,
  status ENUM('available', 'maintenance', 'inactive') NOT NULL DEFAULT 'available',
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_number (room_number),
  KEY idx_rooms_type_status (room_type_id, status),
  CONSTRAINT fk_rooms_room_type
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT IGNORE INTO room_types
  (id, name, description, base_price, capacity, bed_type, amenities, image_url)
VALUES
  (1, 'Garden Standard', 'A calm and comfortable room overlooking the garden, ideal for solo travellers or couples.', 14500.00, 2, 'Queen bed', JSON_ARRAY('Wi-Fi', 'Air conditioning', 'Breakfast', 'Garden view'), NULL),
  (2, 'Ocean Deluxe', 'A spacious coastal room with a private balcony and wide ocean views.', 22500.00, 3, 'King bed', JSON_ARRAY('Wi-Fi', 'Air conditioning', 'Breakfast', 'Private balcony', 'Ocean view'), NULL),
  (3, 'Family Suite', 'A generous suite designed for families, with a separate sitting area and flexible bedding.', 32000.00, 5, 'King bed and twin beds', JSON_ARRAY('Wi-Fi', 'Air conditioning', 'Breakfast', 'Living area', 'Mini refrigerator'), NULL);

INSERT IGNORE INTO rooms
  (room_number, room_type_id, floor, status, notes)
VALUES
  ('101', 1, 1, 'available', NULL),
  ('102', 1, 1, 'available', NULL),
  ('201', 2, 2, 'available', NULL),
  ('202', 2, 2, 'maintenance', 'Scheduled air-conditioning service'),
  ('301', 3, 3, 'available', NULL);
