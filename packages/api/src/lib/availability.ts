import type { PrismaClient } from '@prisma/client';

export interface AvailabilityQuery {
  tenantId: string;
  start: Date;
  end: Date;
  categoryId?: string;
  locationId?: string;
}

/**
 * Return cars active for this tenant that are NOT booked during [start, end).
 * Overlap rule: existing.start < end AND existing.end > start.
 * Cancelled/refunded bookings don't block availability.
 */
export async function findAvailableCars(prisma: PrismaClient, q: AvailabilityQuery) {
  return prisma.car.findMany({
    where: {
      tenantId: q.tenantId,
      status: 'active',
      ...(q.categoryId && { categoryId: q.categoryId }),
      ...(q.locationId && { locationId: q.locationId }),
      bookings: {
        none: {
          status: { in: ['pending', 'confirmed', 'in_progress'] },
          startDate: { lt: q.end },
          endDate: { gt: q.start },
        },
      },
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
      status: { in: ['pending', 'confirmed', 'in_progress'] },
      startDate: { lt: end },
      endDate: { gt: start },
      ...(excludeBookingId && { NOT: { id: excludeBookingId } }),
    },
    select: { id: true },
  });
  return !conflict;
}
