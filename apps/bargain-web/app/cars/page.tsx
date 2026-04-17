import { Suspense } from 'react';
import CarsResults from './CarsResults';
import SearchWidget from '@/components/SearchWidget';
import { Reveal } from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export default function CarsPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined };
}) {
  return (
    <section className="container-px py-14 md:py-20">
      <Reveal>
        <div className="max-w-3xl mb-8">
          <div className="eyebrow mb-3">
            <span className="w-8 h-px bg-gold" /> The fleet
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            Find your <span className="italic font-light bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">ride.</span>
          </h1>
          <p className="mt-4 text-bone-200/70 max-w-xl">
            Pick your dates and we'll only show cars that are actually available. No bait-and-switch.
          </p>
        </div>
      </Reveal>

      <div className="mb-10">
        <SearchWidget
          defaultStart={searchParams.start}
          defaultEnd={searchParams.end}
          defaultCategory={searchParams.category}
        />
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <CarsResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-0 overflow-hidden animate-pulse">
          <div className="aspect-[16/10] bg-ink-900" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-ink-800 rounded w-2/3" />
            <div className="h-3 bg-ink-800 rounded w-1/3" />
            <div className="h-3 bg-ink-800 rounded w-1/2 mt-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
