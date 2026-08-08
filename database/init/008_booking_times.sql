ALTER TABLE bookings
  ADD COLUMN check_in_time TIME NOT NULL DEFAULT '14:00:00' AFTER check_in,
  ADD COLUMN check_out_time TIME NOT NULL DEFAULT '11:00:00' AFTER check_out;
