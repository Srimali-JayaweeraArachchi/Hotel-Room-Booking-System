# Architecture Notes

The project follows the layered architecture selected in the CA01 report:

1. Presentation layer: the React application in `client/`.
2. Business logic layer: Express controllers and services in `server/src/`.
3. Data access/storage layer: repositories and MySQL configuration in
   `server/src/` and `database/`.

The planned User/Authentication, Room/Inventory, Booking/Reservation, Payment,
Notification, and Review/Feedback modules are outside the initial setup phase.
