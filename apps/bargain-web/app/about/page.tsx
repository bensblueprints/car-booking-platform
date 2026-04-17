import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';
import Counter from '@/components/Counter';

export const metadata = {
  title: `About — ${BRAND.short}`,
  description: `Family-owned since ${BRAND.founded}. ${BRAND.tagline}.`,
};

const yearsInBusiness = new Date().getFullYear() - BRAND.founded;

export default function AboutPage() {
  return (
    <>
      <section className="container-px py-14 md:py-20">
        <Reveal>
          <div className="max-w-3xl">
            <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Our story</div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.95]">
              Family-owned. <span className="italic font-light bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">Four decades in.</span>
            </h1>
            <p className="mt-6 text-lg text-bone-200/80 leading-relaxed">
              We opened in {BRAND.founded} with one idea: rent clean cars, charge fair prices, treat people like neighbors.
              That idea built us into South Jersey's most trusted local car rental — one satisfied driver at a time.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container-px py-10">
        <Stagger className="grid md:grid-cols-3 gap-4">
          <StaggerItem>
            <div className="card p-8 text-center">
              <div className="font-display text-5xl font-bold text-flame mb-2">
                <Counter to={yearsInBusiness} />+
              </div>
              <div className="text-sm text-muted uppercase tracking-[0.15em]">Years serving South Jersey</div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card p-8 text-center">
              <div className="font-display text-5xl font-bold text-flame mb-2">1</div>
              <div className="text-sm text-muted uppercase tracking-[0.15em]">Family running it</div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card p-8 text-center">
              <div className="font-display text-5xl font-bold text-flame mb-2">0</div>
              <div className="text-sm text-muted uppercase tracking-[0.15em]">Hidden fees, ever</div>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="container-px py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-line bg-ink-900">
              <Image
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
                alt="Somerdale storefront"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
            </div>
          </Reveal>
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Not a chain. Not a counter. A neighborhood.
            </h2>
            <p className="text-bone-200/80 leading-relaxed mb-4">
              You won't find us at the airport. You won't find us charging $8 to fill the tank or $15 a day for tolls
              you already paid. You'll find us on the White Horse Pike, with the same family that's been handing out
              keys since Reagan was in office.
            </p>
            <p className="text-bone-200/80 leading-relaxed">
              Our job is simple: get you in a clean, reliable car — at a price that doesn't make you flinch — and back on
              the road. That's what we've been doing for {yearsInBusiness}+ years, and it's what we'll keep doing.
            </p>
            <Link href="/contact" className="btn-primary mt-6">
              Come say hi <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
