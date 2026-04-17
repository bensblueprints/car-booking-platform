import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';
import { Quote } from 'lucide-react';

const reviews = [
  { name: 'Marcus H.', body: 'Picked up a minivan for a family trip to the Poconos. Honest price, clean car, zero hassle. Will use every time.', rating: 5, city: 'Cherry Hill, NJ' },
  { name: 'Alicia T.', body: 'My car was in the shop and they got me into a rental the same morning. 40 years in business for a reason.', rating: 5, city: 'Somerdale, NJ' },
  { name: 'Ray (Navy vet)', body: 'Military discount applied no questions asked. That kind of respect means something to me.', rating: 5, city: 'Voorhees, NJ' },
];

export default function Testimonials() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="container-px">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> The verdict</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold">South Jersey trusts us for a reason.</h2>
          </div>
        </Reveal>

        <Stagger className="grid md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <StaggerItem key={r.name}>
              <div className={`card p-7 h-full ${i === 1 ? 'border-flame/40 shadow-[0_0_60px_-20px_rgba(225,29,46,0.4)]' : ''}`}>
                <Quote size={24} className="text-flame mb-4" />
                <p className="text-bone-100 leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-line">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted">{r.city}</div>
                  </div>
                  <div className="text-gold text-sm">{'★'.repeat(r.rating)}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
