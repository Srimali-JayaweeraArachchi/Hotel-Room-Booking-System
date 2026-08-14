import { getNotificationCenter, readAllNotifications, readNotification } from '../services/notificationService.js';

const send = (response, data) => response.json({ status: 'success', data });
export async function listMine(request, response, next) { try { send(response, await getNotificationCenter(request.user.id)); } catch (error) { next(error); } }
export async function markRead(request, response, next) { try { send(response, await readNotification(request.validated.params.id, request.user.id)); } catch (error) { next(error); } }
export async function markAllRead(request, response, next) { try { send(response, await readAllNotifications(request.user.id)); } catch (error) { next(error); } }
