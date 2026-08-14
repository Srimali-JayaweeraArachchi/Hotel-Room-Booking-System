const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const apiOrigin = new URL(apiBaseUrl).origin;

export function resolveMediaUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/api/')) return `${apiOrigin}${imageUrl}`;
  return imageUrl;
}
