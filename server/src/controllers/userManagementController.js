import { changeManagedUserRole, listManagedUsers } from '../services/userManagementService.js';

const send = (response, data) => response.json({ status: 'success', data });

export async function listUsers(request, response, next) {
  try { send(response, { users: await listManagedUsers(request.validated.query) }); }
  catch (error) { next(error); }
}

export async function updateRole(request, response, next) {
  try { send(response, { user: await changeManagedUserRole(request.validated.params.id, request.validated.body.role) }); }
  catch (error) { next(error); }
}
