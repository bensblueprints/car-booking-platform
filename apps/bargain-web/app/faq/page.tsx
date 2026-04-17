import FAQ from '@/components/sections/FAQ';
import { BRAND } from '@/lib/brand';
import CTA from '@/components/sections/CTA';

export const metadata = {
  title: `FAQ — ${BRAND.short}`,
  description: 'Common questions about renting from Bargain Rent-A-Car.',
};

export default function FAQPage() {
  return (
    <>
      <section className="container-px pt-14 md:pt-20 pb-4">
        <div className="max-w-3xl">
          <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Questions</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Quick answers.</h1>
        </div>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
