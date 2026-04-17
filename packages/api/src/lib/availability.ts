import type { PrismaClient } from '@prisma/client';

export interface AvailabilityQuery {
  tenantId: string;
  start: Date;
  end: Date;
  categoryId?: string;
  locationId?: string;
}

/**
 * Pending bookings only block availability for 15 min (checkout in-flight).
 * After that they're abandoned and shouldn't hold the car.
 */
const PENDING_HOLD_MS = 15 * 60 * 1000;

function blockingBookingWhere(start: Date, end: Date, excludeBookingId?: string) {
  const pendingCutoff = new Date(Date.now() - PENDING_HOLD_MS);
  return {
    startDate: { lt: end },
    endDate: { gt: start },
    ...(excludeBookingId && { NOT: { id: excludeBookingId } }),
    OR: [
      { status: { in: ['confirmed', 'in_progress'] } },
      { status: 'pending', createdAt: { gt: pendingCutoff } },
    ],
  };
}

/**
 * Return cars active for this tenant that are NOT booked during [start, end).
 * Overlap rule: existing.start < end AND existing.end > start.
 * Cancelled/refunded/completed and stale-pending bookings don't block.
 */
export async function findAvailableCars(prisma: PrismaClient, q: AvailabilityQuery) {
  return prisma.car.findMany({
    where: {
      tenantId: q.tenantId,
      status: 'active',
      ...(q.categoryId && { categoryId: q.categoryId }),
      ...(q.locationId && { locationId: q.locationId }),
      bookings: { none: blockingBookingWhere(q.start, q.end) },
    },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      location: { select: { id: true, name: true, city: true, state: true } },
    },
    orderBy: { dailyRate: 'asc' },
  });
}

export async function isCarAvailable(
  prisma: PrismaClient,
  carId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      carId,
      ...blockingBookingWhere(start, end, excludeBookingId),
    },
    select: { id: true },
  });
  return !conflict;
}
