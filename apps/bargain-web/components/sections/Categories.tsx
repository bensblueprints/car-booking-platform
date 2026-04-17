import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';

const tiles = [
  { slug: 'small-car', name: 'Small Car', tagline: 'City-friendly. Sip fuel.', img: 'https://images.unsplash.com/photo-1549194822-b9a7a4b4ffba?auto=format&fit=crop&w=1200&q=80', size: 'md:col-span-2 md:row-span-1' },
  { slug: 'mid-sized-car', name: 'Mid-Sized Car', tagline: 'Road trip ready.', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', size: '' },
  { slug: 'full-sized-suv', name: 'Full-Sized SUV', tagline: 'Haul the whole crew.', img: 'https://images.unsplash.com/photo-1519752594763-2633d46d2bff?auto=format&fit=crop&w=1400&q=80', size: 'md:col-span-2 md:row-span-2' },
  { slug: 'mid-sized-suv', name: 'Mid-Sized SUV', tagline: 'All-weather capable.', img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80', size: '' },
  { slug: 'minivan', name: 'Minivan', tagline: '7 seats. Room for life.', img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', size: '' },
  { slug: 'full-sized-car', name: 'Full-Sized Car', tagline: 'Full comfort, full trunk.', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', size: '' },
];

export default function Categories() {
  return (
    <section className="container-px py-20 md:py-28">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> The Fleet</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold max-w-2xl">Six ways to <span className="italic font-light">get going.</span></h2>
          </div>
          <Link href="/cars" className="btn-ghost self-start md:self-auto">Browse all cars <ArrowUpRight size={14} /></Link>
        </div>
      </Reveal>

      <Stagger className="grid md:grid-cols-4 md:auto-rows-[220px] gap-4">
        {tiles.map((t) => (
          <StaggerItem key={t.slug} className={`group ${t.size}`}>
            <Link href={`/cars?category=${t.slug}`} className="relative block h-full min-h-[220px] rounded-2xl overflow-hidden border border-line">
              <Image
                src={t.img}
                alt={t.name}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="font-display text-2xl md:text-3xl font-bold">{t.name}</div>
                <div className="text-sm text-bone-200/70">{t.tagline}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-flame opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  View cars <ArrowUpRight size={12} />
                </div>
              </div>
              <div className="absolute inset-0 ring-0 ring-flame/0 group-hover:ring-2 group-hover:ring-flame/50 transition rounded-2xl pointer-events-none" />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
