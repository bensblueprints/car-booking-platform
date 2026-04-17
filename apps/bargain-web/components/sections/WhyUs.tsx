import { Shield, Clock, HandCoins, Heart, CreditCard, Car } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';

const items = [
  { icon: HandCoins, title: 'No hidden fees', body: 'The price you see is the price you pay. No surprises at the counter, ever.' },
  { icon: Clock, title: 'Same-day rentals', body: 'Walk in today. Drive out today. Car ready in under 15 minutes.' },
  { icon: CreditCard, title: 'No credit check', body: 'Debit, credit, or cash. Your credit score stays your business.' },
  { icon: Shield, title: 'Military discount', body: 'Thank you for serving. Active duty and veterans save every day.' },
  { icon: Heart, title: 'Family-owned since 1985', body: '40+ years of honest service. You\'ll deal with a real person every time.' },
  { icon: Car, title: 'Well-maintained fleet', body: 'Every car inspected, cleaned, and gassed before your pickup.' },
];

export default function WhyUs() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 grid-lines opacity-20 -z-10" aria-hidden />
      <div className="container-px">
        <Reveal>
          <div className="max-w-3xl mb-14">
            <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Why choose us</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold">The rental shop your <span className="italic font-light bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">neighbors</span> keep coming back to.</h2>
          </div>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <StaggerItem key={it.title}>
              <div className="card card-hover p-7 h-full">
                <div className="w-11 h-11 rounded-xl bg-flame/10 border border-flame/20 flex items-center justify-center mb-5 group-hover:bg-flame/20 transition">
                  <it.icon size={18} className="text-flame" />
                </div>
                <h3 className="font-display text-xl mb-2">{it.title}</h3>
                <p className="text-sm text-bone-200/70 leading-relaxed">{it.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
