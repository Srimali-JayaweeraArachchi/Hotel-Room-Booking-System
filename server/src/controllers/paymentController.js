import { listGuestBookingPayments, payForGuestBooking } from '../services/paymentService.js';

const send = (response, data, status = 200) => response.status(status).json({ status: 'success', data });
export async function pay(request, response, next) { try { send(response, await payForGuestBooking(request.validated.params.bookingId, request.user.id, request.validated.body), 201); } catch (error) { next(error); } }
export async function listMine(request, response, next) { try { send(response, { payments: await listGuestBookingPayments(request.validated.params.bookingId, request.user.id) }); } catch (error) { next(error); } }
