'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Shield, Clock, Award } from 'lucide-react';
import SearchWidget from '@/components/SearchWidget';
import Counter from '@/components/Counter';
import { BRAND } from '@/lib/brand';

const headline = ['Hassle-Free', 'Rentals.', 'Honest', 'Prices.'];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background layers */}
      <motion.div style={{ y: parallax }} className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-radial-glow" />
      </motion.div>

      {/* Floating decorative car silhouette */}
      <motion.div
        aria-hidden
        className="absolute right-0 top-1/3 w-[60vw] max-w-[800px] aspect-[16/9] -z-10 opacity-[0.08] blur-[2px]"
        style={{ y: parallax, backgroundImage: "url(https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80)", backgroundSize: 'cover', backgroundPosition: 'center', maskImage: 'linear-gradient(to left, black 30%, transparent 90%)' }}
      />

      <motion.div style={{ opacity }} className="container-px relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-5"
        >
          <span className="w-8 h-px bg-gold" /> South Jersey · Est. {BRAND.founded}
        </motion.div>

        <h1 className="font-display font-black text-[48px] sm:text-[64px] md:text-[88px] lg:text-[112px] leading-[0.95] tracking-tight max-w-5xl">
          {headline.map((word, i) => (
            <motion.span
              key={word + i}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              className={`inline-block mr-4 ${i === 0 ? 'bg-gradient-to-r from-flame via-gold to-flame bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift' : ''} ${i === 2 ? 'italic font-light' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6 text-lg md:text-xl text-bone-200/80 max-w-2xl"
        >
          Family-owned since 1985. Cars, SUVs and minivans ready for same-day pickup in Somerdale.
          <span className="block text-muted text-sm mt-2">No hidden fees. No credit checks. Just a key in your hand.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/cars" className="btn-primary group">
            Browse the fleet <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a href={BRAND.phoneLink} className="btn-ghost">
            <Phone size={14} /> {BRAND.phone}
          </a>
        </motion.div>

        {/* Search widget */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-14 max-w-4xl"
        >
          <SearchWidget />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line"
        >
          <Stat icon={Award} value={<><Counter to={new Date().getFullYear() - BRAND.founded} />+</>} label="Years family-owned" />
          <Stat icon={Clock} value={<>24<span className="text-muted text-lg">/7</span></>} label="Online booking" />
          <Stat icon={Shield} value={<><Counter to={0} suffix="" /> hidden</>} label="Fees, ever" />
          <Stat icon={Award} value={<>5<span className="text-gold">★</span></>} label="Same-day service" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }: any) {
  return (
    <div className="bg-ink-900/80 backdrop-blur p-6 group hover:bg-ink-800 transition">
      <Icon size={16} className="text-flame mb-3" />
      <div className="font-display text-3xl md:text-4xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.15em] text-muted mt-1">{label}</div>
    </div>
  );
}
