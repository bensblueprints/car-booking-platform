'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BRAND } from '@/lib/brand';

const links = [
  { href: '/cars', label: 'Fleet' },
  { href: '/locations', label: 'Locations' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-ink-900/80 backdrop-blur-lg border-b border-line' : 'bg-transparent',
      )}
    >
      <div className="container-px flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-flame to-flame-600 flex items-center justify-center font-display font-black text-white shadow-[0_0_30px_-5px_rgba(225,29,46,0.7)] group-hover:shadow-[0_0_40px_-2px_rgba(225,29,46,0.9)] transition-all">
            B
          </span>
          <span className="hidden sm:block">
            <span className="block font-display font-bold text-sm leading-none">Bargain</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted">Rent-A-Car</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-bone-100/80 hover:text-flame transition link-underline">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={BRAND.phoneLink} className="hidden sm:flex items-center gap-2 text-sm text-bone-100/80 hover:text-flame">
            <Phone size={14} /> {BRAND.phone}
          </a>
          <Link href="/cars" className="btn-primary hidden md:inline-flex text-xs px-5 py-2.5">
            Book now
          </Link>
          <button className="md:hidden p-2 text-bone-50" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-950 md:hidden animate-in fade-in">
          <div className="container-px h-20 flex items-center justify-between">
            <span className="font-display font-bold text-lg">Bargain</span>
            <button onClick={() => setOpen(false)} className="p-2" aria-label="Close"><X size={22} /></button>
          </div>
          <nav className="container-px flex flex-col gap-6 pt-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-3xl font-display" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/cars" className="btn-primary mt-6 self-start" onClick={() => setOpen(false)}>
              Book now
            </Link>
            <a href={BRAND.phoneLink} className="mt-4 text-sm text-muted">{BRAND.phone}</a>
          </nav>
        </div>
      )}
    </header>
  );
}
