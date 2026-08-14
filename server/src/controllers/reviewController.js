import { createGuestReview, deleteGuestReview, listGuestReviews, listRoomTypeReviews, updateGuestReview } from '../services/reviewService.js';

const send = (response, data, status = 200) => response.status(status).json({ status: 'success', data });
export async function listPublic(request, response, next) { try { send(response, await listRoomTypeReviews(request.validated.params.roomTypeId)); } catch (error) { next(error); } }
export async function listMine(request, response, next) { try { send(response, { reviews: await listGuestReviews(request.user.id) }); } catch (error) { next(error); } }
export async function create(request, response, next) { try { send(response, { review: await createGuestReview(request.user.id, request.validated.params.bookingId, request.validated.body) }, 201); } catch (error) { next(error); } }
export async function update(request, response, next) { try { send(response, { review: await updateGuestReview(request.validated.params.id, request.user.id, request.validated.body) }); } catch (error) { next(error); } }
export async function remove(request, response, next) { try { await deleteGuestReview(request.validated.params.id, request.user.id); response.status(204).send(); } catch (error) { next(error); } }
