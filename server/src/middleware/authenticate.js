import { getCurrentUser, verifyAccessToken } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(request, _response, next) {
  try {
    const authorization = request.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token is required');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    request.user = await getCurrentUser(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles) {
  return function roleAuthorization(request, _response, next) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return next(new AppError(403, 'You do not have permission for this action'));
    }

    return next();
  };
}
