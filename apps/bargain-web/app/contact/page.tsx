import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { Reveal } from '@/components/Reveal';

export const metadata = {
  title: `Contact — ${BRAND.short}`,
  description: `Call ${BRAND.phone} or visit us at ${BRAND.address}.`,
};

export default function ContactPage() {
  return (
    <section className="container-px py-14 md:py-20">
      <Reveal>
        <div className="max-w-3xl mb-12">
          <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Get in touch</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Talk to a human.</h1>
          <p className="mt-4 text-lg text-bone-200/80 max-w-xl">
            Call us and someone who actually works here will pick up. Imagine that.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6">
        <Reveal>
          <a href={BRAND.phoneLink} className="card card-hover p-8 block">
            <Phone size={28} className="text-flame mb-4" />
            <div className="text-xs text-muted uppercase tracking-[0.15em] mb-1">Phone</div>
            <div className="font-display text-3xl">{BRAND.phone}</div>
            <div className="text-sm text-muted mt-2">Tap to call. Fastest way to get the car you want.</div>
          </a>
        </Reveal>

        <Reveal>
          <a href={`mailto:${BRAND.email}`} className="card card-hover p-8 block">
            <Mail size={28} className="text-flame mb-4" />
            <div className="text-xs text-muted uppercase tracking-[0.15em] mb-1">Email</div>
            <div className="font-display text-xl break-all">{BRAND.email}</div>
            <div className="text-sm text-muted mt-2">Quotes, long-term rentals, corporate inquiries.</div>
          </a>
        </Reveal>

        <Reveal>
          <div className="card p-8">
            <MapPin size={28} className="text-flame mb-4" />
            <div className="text-xs text-muted uppercase tracking-[0.15em] mb-1">Location</div>
            <div className="font-display text-xl leading-snug">{BRAND.address}</div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.address)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-flame hover:underline mt-3 inline-block"
            >
              Open in Google Maps →
            </a>
          </div>
        </Reveal>

        <Reveal>
          <div className="card p-8">
            <Clock size={28} className="text-flame mb-4" />
            <div className="text-xs text-muted uppercase tracking-[0.15em] mb-3">Hours</div>
            <ul className="space-y-1.5 text-sm">
              {BRAND.hours.map(([d, h]) => (
                <li key={d} className="flex justify-between">
                  <span className="text-muted">{d}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-10 card overflow-hidden">
          <iframe
            title="Map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(BRAND.address)}&output=embed`}
            className="w-full h-[400px] border-0"
            loading="lazy"
          />
        </div>
      </Reveal>
    </section>
  );
}
