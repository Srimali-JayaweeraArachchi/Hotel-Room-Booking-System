CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  booking_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(50) NOT NULL,
  channel ENUM('in_app', 'email') NOT NULL DEFAULT 'in_app',
  title VARCHAR(150) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  delivery_status ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'sent',
  read_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_unread (user_id, read_at, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
