export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
export const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? 'teste-usuario-a';
export const MAX_PHOTOS = 10;
