import {
  findUserById,
  findUsers,
  updateUserRole,
} from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';

export function listManagedUsers(filters) {
  return findUsers(filters);
}

export async function changeManagedUserRole(id, role) {
  const user = await findUserById(id);
  if (!user) throw new AppError(404, 'User account not found');
  if (user.role === 'admin')
    throw new AppError(403, 'Administrator roles cannot be changed here');
  return updateUserRole(id, role);
}
