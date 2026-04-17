import { Reveal } from '@/components/Reveal';

const steps = [
  { n: '01', title: 'Search & select', body: 'Pick your dates, browse the fleet, compare rates.' },
  { n: '02', title: 'Book in 90 seconds', body: 'Choose your car, enter your info, secure with a card.' },
  { n: '03', title: 'Show up & drive', body: 'Walk in, sign the key receipt, you\'re on the road.' },
  { n: '04', title: 'Return, simple', body: 'Bring it back on time. Deposit released in 2–3 business days.' },
];

export default function Process() {
  return (
    <section className="container-px py-20 md:py-28">
      <Reveal>
        <div className="max-w-3xl mb-12">
          <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> How it works</div>
          <h2 className="text-4xl md:text-6xl font-display font-bold">Four steps. No paperwork nightmares.</h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-4 gap-4 relative">
        <div className="absolute top-[42px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-flame/40 to-transparent hidden md:block" aria-hidden />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="card p-6 relative">
              <div className="w-20 h-20 rounded-full bg-ink-900 border-2 border-flame/40 flex items-center justify-center font-display text-2xl font-bold text-flame mb-4 shadow-[0_0_40px_-10px_rgba(225,29,46,0.6)]">
                {s.n}
              </div>
              <h3 className="font-display text-xl mb-2">{s.title}</h3>
              <p className="text-sm text-bone-200/70">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
