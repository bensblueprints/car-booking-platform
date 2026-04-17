import { CarBookingClient } from '@carbooking/sdk';

const TOKEN_KEY = 'carbooking_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = new CarBookingClient({
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  tenantSlug: import.meta.env.VITE_TENANT_SLUG || 'bargain',
  getToken,
});
