import { notFound } from 'next/navigation';
import Image from 'next/image';
import { serverApi } from '@/lib/api';
import BookingFlow from './BookingFlow';

export const dynamic = 'force-dynamic';

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { carId: string };
  searchParams: { start?: string; end?: string; youngDriver?: string };
}) {
  let car;
  try {
    car = await serverApi.car(params.carId);
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }

  const img = car.images[0] ?? 'https://images.unsplash.com/photo-1485395037613-e83d5c1f5290?auto=format&fit=crop&w=1200&q=80';

  return (
    <section className="container-px py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">
          Finish your booking.
        </h1>
        <p className="text-muted mb-10 max-w-xl">
          You're 3 quick steps from the keys. Free cancellation up to 24 hours before pickup.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <BookingFlow
            car={car}
            defaultStart={searchParams.start}
            defaultEnd={searchParams.end}
            defaultYoungDriver={searchParams.youngDriver === '1'}
          />

          <aside className="card p-5 self-start lg:sticky lg:top-28">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-line mb-4">
              <Image src={img} alt="" fill sizes="360px" className="object-cover" />
            </div>
            <div className="font-display text-lg leading-tight">
              {car.year} {car.make} {car.model}
            </div>
            {car.trim && <div className="text-xs text-muted">{car.trim}</div>}
            <div className="mt-4 pt-4 border-t border-line text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted">Daily rate</span><span>${car.dailyRate}</span></div>
              <div className="flex justify-between"><span className="text-muted">Deposit</span><span>${car.depositAmount}</span></div>
              <div className="flex justify-between"><span className="text-muted">Seats</span><span>{car.seats}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
