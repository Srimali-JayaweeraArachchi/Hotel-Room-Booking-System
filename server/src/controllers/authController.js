import {
  changeCurrentUserPassword,
  editCurrentUser,
  loginUser,
  registerGuest,
} from '../services/authService.js';

export async function register(request, response, next) {
  try {
    const result = await registerGuest(request.validated.body);
    response.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const result = await loginUser(request.validated.body);
    response.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

export function getProfile(request, response) {
  response.status(200).json({
    status: 'success',
    data: { user: request.user },
  });
}

export async function updateProfile(request, response, next) {
  try {
    const user = await editCurrentUser(request.user.id, request.validated.body);
    response.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(request, response, next) {
  try {
    await changeCurrentUserPassword(request.user.id, request.validated.body);
    response.json({
      status: 'success',
      data: { message: 'Password changed successfully' },
    });
  } catch (error) {
    next(error);
  }
}
