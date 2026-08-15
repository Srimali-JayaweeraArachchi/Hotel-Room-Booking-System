# Payment Integration Notes

The Payment module (feat(payment) commits) touches the following files
that are otherwise owned by the Booking module. Only these specific
lines are payment-related — the rest of each file belongs to Booking.

## server/src/repositories/bookingRepository.js
- `bookingSelect`: the `paymentStatus` and `paymentReference` subquery columns
- `cancelGuestBookingRecord`: the refund-on-cancel UPDATE to `payments`
- `updateBookingStatusRecord`: the PAID_BOOKING guard and refund-on-cancel UPDATE

## server/src/services/bookingService.js
- `changeBookingStatus`: the guard blocking cancellation of a paid booking

## client/src/components/BookingForm.jsx
- The "held as pending until secure payment confirms" notice text
- The `payBookingId` passed in navigation state after booking creation

## client/src/pages/MyBookingsPage.jsx
- `PaymentForm` import and rendering
- `payingId` state and `paymentComplete` handler
- The payment-status pill next to each booking

## client/src/pages/AdminBookingsPage.jsx
- `PaymentStatus` component and the "Payment" table column
- The guard in `availableTransitions` blocking cancellation of paid bookings