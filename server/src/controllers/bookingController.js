import {
  cancelGuestBooking,
  changeBookingStatus,
  createGuestBooking,
  getGuestBooking,
  listBookingsAdmin,
  listGuestBookings,
  modifyGuestBooking,
} from '../services/bookingService.js';

const send = (response, data, status = 200) => response.status(status).json({ status: 'success', data });
export async function create(request, response, next) { try { send(response, { booking: await createGuestBooking(request.user.id, request.validated.body) }, 201); } catch (error) { next(error); } }
export async function listMine(request, response, next) { try { send(response, { bookings: await listGuestBookings(request.user.id) }); } catch (error) { next(error); } }
export async function getOne(request, response, next) { try { send(response, { booking: await getGuestBooking(request.user, request.validated.params.id) }); } catch (error) { next(error); } }
export async function modify(request, response, next) { try { send(response, { booking: await modifyGuestBooking(request.user.id, request.validated.params.id, request.validated.body) }); } catch (error) { next(error); } }
export async function cancel(request, response, next) { try { send(response, { booking: await cancelGuestBooking(request.user.id, request.validated.params.id) }); } catch (error) { next(error); } }
export async function listAdmin(request, response, next) { try { send(response, { bookings: await listBookingsAdmin(request.validated.query) }); } catch (error) { next(error); } }
export async function updateStatus(request, response, next) { try { send(response, { booking: await changeBookingStatus(request.validated.params.id, request.validated.body, request.user.id) }); } catch (error) { next(error); } }
