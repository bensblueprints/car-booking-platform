import { CarBookingClient } from '@carbooking/sdk';

const TOKEN_KEY = 'carbooking_token';

export const getToken = () =>
  typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (t: string) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, t);
};
export const clearToken = () => {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
};

export const apiClient = new CarBookingClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'bargain',
  getToken,
});

// For Server Components / RSC-safe reads (no token)
export const serverApi = new CarBookingClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'bargain',
});
