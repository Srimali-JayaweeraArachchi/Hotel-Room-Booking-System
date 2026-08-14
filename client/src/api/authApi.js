import httpClient from './httpClient.js';

export async function registerGuest(credentials) {
  const response = await httpClient.post('/auth/register', credentials);
  return response.data.data;
}

export async function loginUser(credentials) {
  const response = await httpClient.post('/auth/login', credentials);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await httpClient.get('/auth/me');
  return response.data.data.user;
}

export async function updateCurrentUser(details) {
  const response = await httpClient.put('/auth/me', details);
  return response.data.data.user;
}

export async function changeCurrentPassword(details) {
  const response = await httpClient.put('/auth/password', details);
  return response.data.data.message;
}
