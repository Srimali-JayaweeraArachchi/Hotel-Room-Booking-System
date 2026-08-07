import httpClient from './httpClient.js';

export async function getManagedUsers(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null),
  );
  const response = await httpClient.get('/admin/users', { params });
  return response.data.data.users;
}

export async function updateManagedUserRole(id, role) {
  const response = await httpClient.patch(`/admin/users/${id}/role`, { role });
  return response.data.data.user;
}
