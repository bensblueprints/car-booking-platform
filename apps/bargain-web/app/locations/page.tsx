import { MapPin, Clock, Phone } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { Reveal } from '@/components/Reveal';

export const metadata = {
  title: `Locations — ${BRAND.short}`,
  description: `Visit us at ${BRAND.address}.`,
};

export default function LocationsPage() {
  return (
    <section className="container-px py-14 md:py-20">
      <Reveal>
        <div className="max-w-3xl mb-12">
          <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Where to find us</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Somerdale HQ.</h1>
          <p className="mt-4 text-lg text-bone-200/80 max-w-xl">
            One location. One family. Serving South Jersey drivers since {BRAND.founded}.
          </p>
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-8">
        <Reveal>
          <div className="card p-8">
            <h2 className="font-display text-2xl mb-5">Bargain Rent-A-Car</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin size={18} className="text-flame flex-shrink-0 mt-0.5" />
                <div>
                  <div>{BRAND.address}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-flame hover:underline text-xs mt-1 inline-block"
                  >
                    Get directions →
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone size={18} className="text-flame flex-shrink-0 mt-0.5" />
                <a href={BRAND.phoneLink} className="hover:text-flame">{BRAND.phone}</a>
              </div>
              <div className="flex gap-3">
                <Clock size={18} className="text-flame flex-shrink-0 mt-0.5" />
                <ul className="space-y-1">
                  {BRAND.hours.map(([d, h]) => (
                    <li key={d} className="flex gap-4">
                      <span className="text-muted w-24">{d}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-line">
              <h3 className="font-semibold mb-2">We serve these areas:</h3>
              <p className="text-sm text-muted leading-relaxed">
                Somerdale, Cherry Hill, Voorhees, Stratford, Lindenwold, Gloucester Township, Blackwood, Haddon Heights,
                Barrington, Magnolia, Audubon, Collingswood, Haddonfield, Mt. Ephraim, and all of South Jersey.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="card overflow-hidden h-full min-h-[400px]">
            <iframe
              title="Map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(BRAND.address)}&output=embed`}
              className="w-full h-full border-0 min-h-[400px]"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
