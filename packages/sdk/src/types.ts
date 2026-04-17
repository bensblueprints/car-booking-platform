// Shared types for API consumers. Mirror the Prisma schema (Decimals as strings).

export interface TenantPublic {
  id: string;
  slug: string;
  name: string;
  currency: string;
  timezone: string;
  branding: Branding | null;
}

export interface Branding {
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  darkColor?: string;
  fonts?: { display?: string; body?: string };
  phone?: string;
  email?: string;
  address?: string;
  hours?: Record<string, string>;
  founded?: number;
  logoUrl?: string;
  social?: Record<string, string>;
  [k: string]: unknown;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  imageUrl: string | null;
  _count?: { cars: number };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Car {
  id: string;
  categoryId: string;
  category?: Category;
  locationId: string | null;
  location?: Location | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  seats: number;
  doors: number;
  transmission: 'automatic' | 'manual';
  fuelType: 'gas' | 'hybrid' | 'ev' | 'diesel';
  mpg: number | null;
  features: string[];
  images: string[];
  color: string | null;
  dailyRate: string;
  weeklyRate: string | null;
  monthlyRate: string | null;
  depositAmount: string;
  mileageLimit: number | null;
  status: 'active' | 'maintenance' | 'retired';
  description: string | null;
  vin: string | null;
  licensePlate: string | null;
  averageRating?: number | null;
  reviewCount?: number;
}

export interface Quote {
  days: number;
  dailyRate: number;
  subtotal: number;
  taxes: number;
  fees: number;
  depositHeld: number;
  totalAmount: number;
  breakdown: Array<{ label: string; amount: number }>;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  car?: Pick<Car, 'id' | 'make' | 'model' | 'year' | 'images'>;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: string;
  subtotal: string;
  taxes: string;
  fees: string;
  depositHeld: string;
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  stripePaymentId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'customer' | 'staff' | 'admin';
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  approved: boolean;
  adminReply: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

export interface SearchParams {
  start?: string; // ISO
  end?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: 'automatic' | 'manual';
}
