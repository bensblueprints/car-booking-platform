import type {
  TenantPublic, Category, Car, Quote, Booking, User, Review, SearchParams,
} from './types.js';

export interface ClientOptions {
  apiUrl: string;
  tenantSlug?: string;
  /** Optional: provide a function that returns the current JWT (e.g. from localStorage). */
  getToken?: () => string | null | undefined;
  fetch?: typeof fetch;
}

export class CarBookingClient {
  private apiUrl: string;
  private tenantSlug?: string;
  private getToken?: () => string | null | undefined;
  private fetchFn: typeof fetch;

  constructor(opts: ClientOptions) {
    this.apiUrl = opts.apiUrl.replace(/\/$/, '');
    this.tenantSlug = opts.tenantSlug;
    this.getToken = opts.getToken;
    this.fetchFn = opts.fetch ?? fetch.bind(globalThis);
  }

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    if (this.tenantSlug) headers.set('X-Tenant-Slug', this.tenantSlug);
    const token = this.getToken?.();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await this.fetchFn(`${this.apiUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      let body: any = null;
      try { body = await res.json(); } catch { /* non-JSON error body */ }
      const err: any = new Error(body?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  // Public
  tenant(slug: string) { return this.req<TenantPublic>(`/v1/tenants/${slug}`); }
  categories() { return this.req<Category[]>(`/v1/categories`); }
  category(slug: string) { return this.req<Category & { cars: Car[] }>(`/v1/categories/${slug}`); }

  searchCars(params: SearchParams = {}) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v != null) q.set(k, String(v));
    return this.req<Car[]>(`/v1/cars/search?${q.toString()}`);
  }
  car(id: string) { return this.req<Car>(`/v1/cars/${id}`); }
  carReviews(carId: string) { return this.req<Review[]>(`/v1/cars/${carId}/reviews`); }

  // Auth
  register(body: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return this.req<{ token: string; user: User }>(`/v1/auth/register`, { method: 'POST', body: JSON.stringify(body) });
  }
  login(body: { email: string; password: string }) {
    return this.req<{ token: string; user: User }>(`/v1/auth/login`, { method: 'POST', body: JSON.stringify(body) });
  }

  // Authenticated
  me() { return this.req<User>(`/v1/me`); }
  updateMe(body: Partial<User> & { dateOfBirth?: string; licenseNumber?: string; licenseExpiry?: string; licenseImage?: string }) {
    return this.req<User>(`/v1/me`, { method: 'PATCH', body: JSON.stringify(body) });
  }
  myBookings() { return this.req<Booking[]>(`/v1/me/bookings`); }

  // Bookings
  quoteBooking(body: { carId: string; start: string; end: string; youngDriver?: boolean; airportPickup?: boolean }) {
    return this.req<{ available: boolean; quote: Quote }>(`/v1/bookings/quote`, { method: 'POST', body: JSON.stringify(body) });
  }
  createBooking(body: { carId: string; start: string; end: string; pickupLocationId?: string; dropoffLocationId?: string; notes?: string; youngDriver?: boolean; airportPickup?: boolean }) {
    return this.req<{ booking: Booking; quote: Quote; clientSecret: string | null }>(`/v1/bookings`, { method: 'POST', body: JSON.stringify(body) });
  }
  booking(id: string) { return this.req<Booking>(`/v1/bookings/${id}`); }
  cancelBooking(id: string) { return this.req<Booking>(`/v1/bookings/${id}/cancel`, { method: 'POST' }); }
  submitReview(bookingId: string, body: { rating: number; title?: string; body: string }) {
    return this.req<Review>(`/v1/bookings/${bookingId}/review`, { method: 'POST', body: JSON.stringify(body) });
  }

  // Admin (same client — token must have role:admin|staff)
  admin = {
    cars: () => this.req<Car[]>(`/v1/admin/cars`),
    createCar: (body: any) => this.req<Car>(`/v1/admin/cars`, { method: 'POST', body: JSON.stringify(body) }),
    updateCar: (id: string, body: any) => this.req<Car>(`/v1/admin/cars/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteCar: (id: string) => this.req<Car>(`/v1/admin/cars/${id}`, { method: 'DELETE' }),

    categories: () => this.req<Category[]>(`/v1/categories`),
    createCategory: (body: any) => this.req<Category>(`/v1/admin/categories`, { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id: string, body: any) => this.req<Category>(`/v1/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteCategory: (id: string) => this.req<{ ok: true }>(`/v1/admin/categories/${id}`, { method: 'DELETE' }),

    locations: () => this.req<any[]>(`/v1/admin/locations`),
    createLocation: (body: any) => this.req<any>(`/v1/admin/locations`, { method: 'POST', body: JSON.stringify(body) }),
    updateLocation: (id: string, body: any) => this.req<any>(`/v1/admin/locations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteLocation: (id: string) => this.req<{ ok: true }>(`/v1/admin/locations/${id}`, { method: 'DELETE' }),

    bookings: (status?: string) => this.req<Booking[]>(`/v1/admin/bookings${status ? `?status=${status}` : ''}`),
    booking: (id: string) => this.req<Booking>(`/v1/admin/bookings/${id}`),
    updateBooking: (id: string, body: { status?: string; notes?: string }) =>
      this.req<Booking>(`/v1/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    reviews: (approved?: boolean) => this.req<Review[]>(`/v1/admin/reviews${approved !== undefined ? `?approved=${approved}` : ''}`),
    updateReview: (id: string, body: { approved?: boolean; adminReply?: string }) =>
      this.req<Review>(`/v1/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteReview: (id: string) => this.req<{ ok: true }>(`/v1/admin/reviews/${id}`, { method: 'DELETE' }),

    stats: () => this.req<any>(`/v1/admin/stats`),
    customers: (search?: string) => this.req<any[]>(`/v1/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    customer: (id: string) => this.req<any>(`/v1/admin/customers/${id}`),

    tenant: () => this.req<any>(`/v1/admin/tenant`),
    updateTenant: (body: any) => this.req<any>(`/v1/admin/tenant`, { method: 'PATCH', body: JSON.stringify(body) }),
  };
}
