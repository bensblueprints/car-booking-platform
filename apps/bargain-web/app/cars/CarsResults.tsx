import CarCard from '@/components/CarCard';
import { Stagger, StaggerItem } from '@/components/Reveal';
import { serverApi } from '@/lib/api';
import Link from 'next/link';

export default async function CarsResults({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined };
}) {
  const params: Record<string, string> = {};
  if (searchParams.start) params.start = searchParams.start;
  if (searchParams.end) params.end = searchParams.end;
  if (searchParams.category) params.category = searchParams.category;
  if (searchParams.location) params.location = searchParams.location;
  if (searchParams.minPrice) params.minPrice = searchParams.minPrice;
  if (searchParams.maxPrice) params.maxPrice = searchParams.maxPrice;
  if (searchParams.seats) params.seats = searchParams.seats;
  if (searchParams.transmission) params.transmission = searchParams.transmission;

  let cars: Awaited<ReturnType<typeof serverApi.searchCars>> = [];
  let error: string | null = null;
  try {
    cars = await serverApi.searchCars(params);
  } catch (e: any) {
    error = e?.message || 'Could not load the fleet. Please try again.';
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <h3 className="font-display text-2xl mb-2">We hit a bump.</h3>
        <p className="text-muted mb-6">{error}</p>
        <Link href="/cars" className="btn-ghost">Reset search</Link>
      </div>
    );
  }

  if (!cars.length) {
    return (
      <div className="card p-10 text-center">
        <h3 className="font-display text-2xl mb-2">No cars match those filters.</h3>
        <p className="text-muted mb-6">Try widening your dates, or give us a call — we'll find one that fits.</p>
        <Link href="/cars" className="btn-primary">Show all cars</Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted">
          <span className="text-bone-100 font-semibold">{cars.length}</span>{' '}
          {cars.length === 1 ? 'car' : 'cars'} available
        </div>
      </div>
      <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cars.map((c) => (
          <StaggerItem key={c.id}>
            <CarCard car={c} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
