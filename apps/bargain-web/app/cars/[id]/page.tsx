import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Users, Cog, Fuel, Gauge, DoorOpen, Shield, Phone } from 'lucide-react';
import { serverApi } from '@/lib/api';
import { BRAND } from '@/lib/brand';
import { Reveal } from '@/components/Reveal';
import BookingWidget from './BookingWidget';
import ReviewList from './ReviewList';

export const dynamic = 'force-dynamic';

export default async function CarDetail({ params }: { params: { id: string } }) {
  let car;
  try {
    car = await serverApi.car(params.id);
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }

  let reviews: Awaited<ReturnType<typeof serverApi.carReviews>> = [];
  try {
    reviews = await serverApi.carReviews(params.id);
  } catch {
    reviews = [];
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const hero = car.images[0] ?? 'https://images.unsplash.com/photo-1485395037613-e83d5c1f5290?auto=format&fit=crop&w=2000&q=80';
  const gallery = car.images.slice(1, 5);

  return (
    <section className="container-px py-14 md:py-20">
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-bone-100">Home</Link>
        <span>/</span>
        <Link href="/cars" className="hover:text-bone-100">Fleet</Link>
        <span>/</span>
        <span className="text-bone-100">{car.year} {car.make} {car.model}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10">
        <div>
          <Reveal>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-line bg-ink-900">
              <Image
                src={hero}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                sizes="(max-width:1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-ink-950/80 border border-line text-xs uppercase tracking-[0.15em]">
                {car.category?.name}
              </div>
              {avgRating !== null && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-ink-950/80 border border-line text-xs flex items-center gap-1.5">
                  <span className="text-gold">★</span>
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-muted">({reviews.length})</span>
                </div>
              )}
            </div>
          </Reveal>

          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {gallery.map((src, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-line bg-ink-900">
                  <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <Reveal>
            <div className="mt-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                {car.year} {car.make} {car.model}
              </h1>
              {car.trim && (
                <p className="mt-2 text-muted">
                  {car.trim}
                  {car.color ? ` · ${car.color}` : ''}
                </p>
              )}
              {car.description && (
                <p className="mt-5 text-bone-200/80 leading-relaxed max-w-2xl">{car.description}</p>
              )}
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Spec icon={<Users size={16} />} label="Seats" value={String(car.seats)} />
              <Spec icon={<DoorOpen size={16} />} label="Doors" value={String(car.doors)} />
              <Spec icon={<Cog size={16} />} label="Transmission" value={car.transmission === 'automatic' ? 'Automatic' : 'Manual'} />
              <Spec icon={<Fuel size={16} />} label="Fuel" value={car.fuelType === 'ev' ? 'Electric' : car.fuelType} />
              {car.mpg && <Spec icon={<Gauge size={16} />} label="Fuel economy" value={`${car.mpg} mpg`} />}
              {car.mileageLimit && <Spec icon={<Gauge size={16} />} label="Daily mileage" value={`${car.mileageLimit} mi`} />}
              <Spec icon={<Shield size={16} />} label="Deposit" value={`$${car.depositAmount}`} />
            </div>
          </Reveal>

          {car.features?.length > 0 && (
            <Reveal>
              <div className="mt-10">
                <h2 className="font-display text-2xl mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f) => (
                    <span key={f} className="px-3 py-1.5 rounded-full border border-line bg-ink-900/70 text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="mt-10">
              <h2 className="font-display text-2xl mb-4">Rates</h2>
              <div className="card divide-y divide-line">
                <Rate label="Daily" price={car.dailyRate} />
                {car.weeklyRate && <Rate label="Weekly (7+ days)" price={car.weeklyRate} note={`$${(Number(car.weeklyRate) / 7).toFixed(2)} per day`} />}
                {car.monthlyRate && <Rate label="Monthly (28+ days)" price={car.monthlyRate} note={`$${(Number(car.monthlyRate) / 28).toFixed(2)} per day`} />}
              </div>
              <p className="mt-3 text-xs text-muted">
                All rates exclude 6.625% NJ sales tax. ${car.depositAmount} refundable deposit held at pickup, released 2–3 business days after return.
              </p>
            </div>
          </Reveal>

          <ReviewList reviews={reviews} />
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <BookingWidget car={car} />
          <div className="mt-4 card p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Phone size={16} className="text-flame" /> Prefer to call?
            </div>
            <p className="text-muted mb-3">We'll check availability and hold the car while you talk.</p>
            <a href={BRAND.phoneLink} className="btn-ghost w-full justify-center">
              {BRAND.phone} <ArrowRight size={14} />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-muted mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]">
        {icon} {label}
      </div>
      <div className="font-display text-lg capitalize">{value}</div>
    </div>
  );
}

function Rate({ label, price, note }: { label: string; price: string | number; note?: string }) {
  return (
    <div className="flex items-center justify-between p-5">
      <div>
        <div className="font-semibold">{label}</div>
        {note && <div className="text-xs text-muted mt-0.5">{note}</div>}
      </div>
      <div className="font-display text-xl">
        ${price}
        <span className="text-muted text-xs font-normal">
          {label.startsWith('Daily') ? '/day' : label.startsWith('Weekly') ? '/week' : '/month'}
        </span>
      </div>
    </div>
  );
}
