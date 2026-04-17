import Link from 'next/link';
import Image from 'next/image';
import type { Car } from '@carbooking/sdk';
import { Users, Fuel, Cog } from 'lucide-react';

export default function CarCard({ car }: { car: Car }) {
  const img = car.images[0] ?? 'https://images.unsplash.com/photo-1549194822-b9a7a4b4ffba?auto=format&fit=crop&w=1200&q=80';
  return (
    <Link
      href={`/cars/${car.id}`}
      className="card card-hover overflow-hidden group flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
        <Image
          src={img}
          alt={`${car.year} ${car.make} ${car.model}`}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-900/30 to-transparent" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 border border-line text-[10px] uppercase tracking-[0.15em]">
          {car.category?.name}
        </div>
        <div className="absolute bottom-3 right-3 text-right">
          <div className="text-[10px] text-muted">from</div>
          <div className="font-display font-bold text-xl">${car.dailyRate}<span className="text-muted text-xs font-normal">/day</span></div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg leading-tight">{car.year} {car.make} {car.model}</h3>
        {car.trim && <div className="text-xs text-muted mb-3">{car.trim}{car.color ? ` · ${car.color}` : ''}</div>}
        <div className="flex gap-4 text-xs text-muted mt-auto pt-3 border-t border-line">
          <span className="flex items-center gap-1"><Users size={12} /> {car.seats}</span>
          <span className="flex items-center gap-1"><Cog size={12} /> {car.transmission === 'automatic' ? 'Auto' : 'Manual'}</span>
          <span className="flex items-center gap-1"><Fuel size={12} /> {car.fuelType === 'ev' ? 'Electric' : car.fuelType}</span>
          {car.mpg && <span className="ml-auto">{car.mpg} mpg</span>}
        </div>
      </div>
    </Link>
  );
}
