import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUserPassword,
  updateUserProfile,
} from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';

const passwordSaltRounds = 12;

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );
}

export async function registerGuest({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, passwordSaltRounds);
  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'guest',
  });

  return { user };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail, { includePassword: true });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches || !user.isActive) {
    throw new AppError(401, 'Invalid email or password');
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return { user: publicUser, accessToken: createAccessToken(publicUser) };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    throw new AppError(401, 'Invalid or expired access token');
  }
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user || !user.isActive) {
    throw new AppError(401, 'User account is unavailable');
  }

  return user;
}

export async function editCurrentUser(userId, { name, email }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser && existingUser.id !== userId) {
    throw new AppError(409, 'An account with this email already exists');
  }
  return updateUserProfile(userId, { name: name.trim(), email: normalizedEmail });
}

export async function changeCurrentUserPassword(userId, { currentPassword, newPassword }) {
  const user = await findUserByIdWithPassword(userId);
  const passwordMatches = user ? await bcrypt.compare(currentPassword, user.passwordHash) : false;
  if (!passwordMatches) throw new AppError(400, 'Current password is incorrect');
  const passwordHash = await bcrypt.hash(newPassword, passwordSaltRounds);
  await updateUserPassword(userId, passwordHash);
}
