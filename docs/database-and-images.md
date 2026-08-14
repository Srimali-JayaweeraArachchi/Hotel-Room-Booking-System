# Database and Room Image Guide

## Viewing users and administrators

The project database runs inside Docker and is exposed on port `3307`. XAMPP's
MySQL usually remains on port `3306`; these are separate databases.

### Terminal

List users and roles:

```powershell
docker exec hotel-booking-db mysql -uhotel_app -photel_app_password -D hotel_booking -e "SELECT id, name, email, role, is_active, created_at FROM users;"
```

List only administrators:

```powershell
docker exec hotel-booking-db mysql -uhotel_app -photel_app_password -D hotel_booking -e "SELECT id, name, email, role FROM users WHERE role='admin';"
```

List bookings:

```powershell
docker exec hotel-booking-db mysql -uhotel_app -photel_app_password -D hotel_booking -e "SELECT reference, user_id, room_id, check_in, check_out, status, total_amount FROM bookings;"
```

### MySQL Workbench, DBeaver, or phpMyAdmin connection

- Host: `127.0.0.1`
- Port: `3307`
- Database: `hotel_booking`
- Username: `hotel_app`
- Password: `hotel_app_password`

XAMPP's bundled phpMyAdmin is normally configured for port `3306`. To view the
Docker database there, add a second phpMyAdmin server configured for port
`3307`, or use MySQL Workbench/DBeaver with the settings above.

## How room images are stored

The current database stores an image URL in `room_types.image_url`; it does not
store the binary image file. This is the recommended approach for the project:

The prototype supports direct multiple-file uploads from the Room Type form.
Choose up to ten JPG, PNG, or WebP files; each file may be up to 5 MB. Image
bytes are stored persistently in Docker MySQL using the
`room_type_images.image_data` `LONGBLOB` column. MIME type, file size, alt text,
and ordering are stored alongside the bytes. The public
`/api/room-images/:id` endpoint streams each image back to the browser.

For production hosting, replace local storage with an object/image service:

1. Upload the image to a service such as Cloudinary, Amazon S3,
   Azure Blob Storage, or another HTTPS-accessible location.
2. Copy the resulting HTTPS image URL.
3. Open the admin Inventory page and paste it into `Image URL` for the room
   type.
4. The URL is stored in MySQL and the React client loads the image from that
   URL.

Example database value:

```text
https://res.cloudinary.com/example/image/upload/hotel/ocean-deluxe.jpg
```

MySQL BLOB storage is convenient and persistent for this student prototype, and
it travels with database backups. For a high-traffic production system,
Cloudinary/S3-style object storage remains preferable because database size and
backup time grow with every image. Do not encode images as Base64 JSON; the API
streams raw binary with the correct MIME type.

For a local prototype, an image can also be placed in `client/public/rooms/`
and referenced as `/rooms/image-name.jpg`. This works locally, but cloud/object
storage is better when administrators need to upload images dynamically.

Room cards and detail pages automatically rotate gallery images every four
seconds. Users can use arrow buttons or indicators and can open any image in a
full-screen viewer.
