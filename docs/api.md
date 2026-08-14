# API Guide - Step 1: User and Authentication

Base URL: `http://localhost:5000/api`

## Register a guest

`POST /auth/register`

```json
{
  "name": "Sample Guest",
  "email": "guest@example.com",
  "password": "Guest123"
}
```

Successful response: `201 Created`. Public registration always creates a
`guest`; callers cannot assign themselves the `staff` or `admin` role. Account
creation does not issue a JWT or start a session. The user must log in with the
registered email and password afterward.

## Log in

`POST /auth/login`

```json
{
  "email": "guest@example.com",
  "password": "Guest123"
}
```

Successful response: `200 OK` with the user and an `accessToken`.

## View the authenticated user

`GET /auth/me`

Send the token returned by register or login:

```text
Authorization: Bearer <accessToken>
```

Successful response: `200 OK`. Missing, invalid, or expired tokens return
`401 Unauthorized`.

## Profile settings

All guest, staff, and administrator accounts use the same authenticated
settings endpoints:

- `PUT /auth/me` - update the current user's name and email address. Role
  assignment is deliberately excluded.
- `PUT /auth/password` - change the password after verifying the current
  password. The new password uses the registration strength policy.

## Current security rules

- Passwords must contain at least eight characters, one lowercase letter, one
  uppercase letter, and one number.
- Passwords are hashed with bcrypt before storage.
- JWT access tokens expire according to `JWT_EXPIRES_IN`.
- Protected requests reload the user from MySQL to ensure the account is still
  active.
- Registration and login requests are rate-limited to reduce automated
  credential attacks.

## Room and Inventory API

### Public guest endpoints

- `GET /rooms` - list room types with available physical-room counts.
- `GET /rooms/:id` - view one available room type.

Supported search query parameters are `search`, `guests`, `minPrice`, and
`maxPrice`. The API also accepts `checkIn` and `checkOut` as the foundation for
the Booking module; date-overlap checks will be activated when bookings are
implemented.

### Admin-only inventory endpoints

All routes require a valid admin access token.

- `GET|POST /admin/inventory/room-types`
- `PUT|DELETE /admin/inventory/room-types/:id`
- `GET|POST /admin/inventory/rooms`
- `PUT|DELETE /admin/inventory/rooms/:id`

Physical-room statuses are `available`, `maintenance`, and `inactive`.

To access the inventory dashboard, first register normally and then promote the
account from the project terminal:

```powershell
npm run user:make-admin -- user@example.com
```

Log out and log in again so the new JWT contains the admin role.

To create a front-desk staff account, register normally and run:

```powershell
npm run user:make-staff -- staff@example.com
```

Log out and log in again. Staff members receive a dedicated dashboard for
pending confirmations, today's arrivals and departures, checked-in guests, and
valid booking status transitions. They cannot manage room types, prices, or
physical inventory.

## Booking and Reservation API

Guest routes require authentication:

- `POST /bookings` - create a pending booking.
- `GET /bookings/me` - list the current guest's bookings.
- `GET /bookings/:id` - view one permitted booking.
- `PUT /bookings/:id` - modify dates, guest count, or requests.
- `PATCH /bookings/:id/cancel` - cancel an eligible booking.

Admin/staff viewing route:

- `GET /admin/bookings` - search and filter all bookings.

Staff-only operational route:

- `PATCH /admin/bookings/:id/status` - apply a valid status transition. Administrators have read-only booking access.

Active bookings participate in overlap checks. Booking creation selects and
locks an available physical room inside a database transaction, preventing two
simultaneous requests from assigning the same room for overlapping dates.
Booking create and update payloads also include `checkInTime` and
`checkOutTime` in 24-hour `HH:mm` format. Existing bookings use the hotel
defaults 14:00 and 11:00. The admin/staff overview returns `paymentStatus` and
`paymentReference`; staff cannot cancel a successfully paid booking.

## Payment API

Guest payment routes require authentication and ownership of the booking:

- `GET /payments/bookings/:bookingId` - view payment attempts for a booking.
- `POST /payments/bookings/:bookingId` - process a tokenized prototype card payment.

The browser sends only a prototype gateway token; raw card details are never
sent to Express or stored in MySQL. Payment success and the booking transition
from `pending` to `confirmed` are committed in one database transaction. A
declined attempt is recorded as failed while the booking remains pending.
Paid bookings cannot be repriced through guest modification. Cancelling a
confirmed paid booking records a prototype refund in the same transaction.

Prototype cards:

- `4242 4242 4242 4242` - successful payment.
- `4000 0000 0000 0002` - declined payment.

## Notification API

The notification center is available to guest, staff, and administrator roles
and is persisted in MySQL:

- `GET /notifications` - list notifications and unread count.
- `PATCH /notifications/:id/read` - mark one owned notification as read.
- `PATCH /notifications/read-all` - mark all owned notifications as read.

Booking creation, payment success/failure, refund/cancellation, check-in, and
completed-stay events create in-app notifications. Payment confirmation also
creates an auditable `email` channel record using the prototype email adapter;
no real external email is claimed or sent until provider credentials are configured.
Notification recipients are event-specific: guests receive payment, cancellation,
refund, and stay-status confirmations but not a redundant notification for an
action they just performed when creating a booking. Staff receive new-booking,
successful-payment, and guest-cancellation events that need front-desk awareness.
Admins receive payment/refund and operational check-in/completion events for
management oversight.

## Review and Feedback API

- `GET /reviews/room-types/:roomTypeId` - public published reviews, count,
  and average rating.
- `POST /reviews/bookings/:bookingId` - guest submits one verified-stay review.
- `GET /reviews/me` - guest lists their own published reviews.
- `PUT /reviews/:id` - owner edits a review.
- `DELETE /reviews/:id` - owner deletes a review.

Submission requires an owned booking with `completed` status and a successful
payment. Rating is 1-5, and a database unique constraint guarantees one review
per booking. New reviews are immediately published and notify administrators.
