import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { BRAND } from '@/lib/brand';

export default function CTA() {
  return (
    <section className="container-px py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-flame/30 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-radial-glow" aria-hidden />
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-transparent via-flame/20 to-transparent opacity-60 blur-2xl" aria-hidden />

          <div className="relative max-w-3xl mx-auto">
            <div className="eyebrow mb-4 justify-center"><span className="w-8 h-px bg-gold" /> Ready when you are</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              Key in your hand <span className="italic font-light bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">in 15 minutes.</span>
            </h2>
            <p className="mt-5 text-bone-200/80 max-w-xl mx-auto">
              Book online and skip the counter, or call us and we\u2019ll have the car warmed up for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/cars" className="btn-primary">
                Pick your car <ArrowRight size={16} />
              </Link>
              <a href={BRAND.phoneLink} className="btn-ghost">
                <Phone size={14} /> {BRAND.phone}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
