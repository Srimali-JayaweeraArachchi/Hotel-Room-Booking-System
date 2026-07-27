export function getHealth(_request, response) {
  response.status(200).json({
    status: 'ok',
    service: 'hotel-booking-api',
    timestamp: new Date().toISOString(),
  });
}
