import axios from 'axios';

export const accessTokenStorageKey = 'hotel_booking_access_token';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(accessTokenStorageKey);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default httpClient;
