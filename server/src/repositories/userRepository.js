import database from '../config/database.js';

const publicUserColumns =
  'id, name, email, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt';

function normalizeUser(user) {
  return user ? { ...user, isActive: Boolean(user.isActive) } : null;
}

export async function createUser({
  name,
  email,
  passwordHash,
  role = 'guest',
}) {
  const [result] = await database.execute(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [name, email, passwordHash, role],
  );

  return findUserById(result.insertId);
}

export async function findUserByEmail(email, { includePassword = false } = {}) {
  const columns = includePassword
    ? `${publicUserColumns}, password_hash AS passwordHash`
    : publicUserColumns;

  const [rows] = await database.execute(
    `SELECT ${columns} FROM users WHERE email = ? LIMIT 1`,
    [email],
  );

  return normalizeUser(rows[0]);
}

export async function findUserById(id) {
  const [rows] = await database.execute(
    `SELECT ${publicUserColumns} FROM users WHERE id = ? LIMIT 1`,
    [id],
  );

  return normalizeUser(rows[0]);
}

export async function findUserByIdWithPassword(id) {
  const [rows] = await database.execute(
    `SELECT ${publicUserColumns}, password_hash AS passwordHash FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return normalizeUser(rows[0]);
}

export async function updateUserProfile(id, { name, email }) {
  await database.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [
    name,
    email,
    id,
  ]);
  return findUserById(id);
}

export async function updateUserPassword(id, passwordHash) {
  await database.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
    passwordHash,
    id,
  ]);
}

export async function findUsers({ search, role } = {}) {
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    conditions.push('role = ?');
    values.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await database.execute(
    `SELECT ${publicUserColumns} FROM users ${where} ORDER BY created_at DESC`,
    values,
  );
  return rows.map(normalizeUser);
}

export async function updateUserRole(id, role) {
  await database.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  return findUserById(id);
}
