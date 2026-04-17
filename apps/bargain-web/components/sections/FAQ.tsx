'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const faqs = [
  { q: 'What do I need to rent a car?', a: 'A valid driver\'s license, a major credit or debit card in your name, and proof of insurance if you\'re using your own policy. We also accept most personal insurance, and can provide coverage options at the counter.' },
  { q: 'Do you run credit checks?', a: 'No. We never pull credit. We verify your license and accept most debit and credit cards. A refundable deposit covers any incidentals.' },
  { q: 'How old do I have to be?', a: 'The primary driver must be at least 21. Drivers under 25 may be subject to a small young-driver fee.' },
  { q: 'Can I rent the same day?', a: 'Yes — same-day and walk-in rentals are our specialty. Call ahead at (856) 226-4415 to confirm the car you want is ready, or book online.' },
  { q: 'Is there a military discount?', a: 'Every day. Just show a valid military or veteran ID at pickup. Thank you for your service.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before pickup. No penalties, no hidden fees — ever.' },
  { q: 'Do you offer long-term rentals?', a: 'Yes — weekly and monthly rates available on every car. The longer you rent, the better the per-day price.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container-px py-20 md:py-28">
      <Reveal>
        <div className="max-w-3xl mb-12">
          <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> Questions</div>
          <h2 className="text-4xl md:text-6xl font-display font-bold">Quick answers.</h2>
        </div>
      </Reveal>

      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04}>
              <button
                className="w-full text-left py-6 flex items-center justify-between gap-4 group"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="font-display text-lg md:text-xl">{f.q}</span>
                <ChevronDown size={18} className={`text-flame flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-bone-200/80 leading-relaxed max-w-2xl">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
