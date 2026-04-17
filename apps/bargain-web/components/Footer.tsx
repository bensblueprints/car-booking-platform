import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export default function Footer() {
  return (
    <footer className="relative border-t border-line mt-20">
      <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
      <div className="relative container-px py-16">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-flame to-flame-600 flex items-center justify-center font-display font-black text-white">B</span>
              <span className="font-display font-bold">Bargain Rent-A-Car</span>
            </div>
            <p className="text-sm text-muted max-w-sm">
              Family-owned in South Jersey since {BRAND.founded}. Honest prices, same-day rentals, no hidden fees.
            </p>
            <div className="flex gap-3 mt-6">
              <a href={BRAND.social.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-flame hover:text-flame transition">
                <Facebook size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Fleet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cars?category=small-car" className="hover:text-flame">Small cars</Link></li>
              <li><Link href="/cars?category=mid-sized-car" className="hover:text-flame">Mid-sized cars</Link></li>
              <li><Link href="/cars?category=full-sized-suv" className="hover:text-flame">Full-sized SUVs</Link></li>
              <li><Link href="/cars?category=minivan" className="hover:text-flame">Minivans</Link></li>
              <li><Link href="/cars" className="hover:text-flame">See all →</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-flame">About</Link></li>
              <li><Link href="/locations" className="hover:text-flame">Locations</Link></li>
              <li><Link href="/faq" className="hover:text-flame">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-flame">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><Phone size={14} className="mt-0.5 text-flame" /><a href={BRAND.phoneLink} className="hover:text-flame">{BRAND.phone}</a></li>
              <li className="flex items-start gap-2"><Mail size={14} className="mt-0.5 text-flame" /><a href={`mailto:${BRAND.email}`} className="hover:text-flame break-all">{BRAND.email}</a></li>
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-flame" /><span>{BRAND.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line mt-12 pt-6 flex flex-col md:flex-row justify-between text-xs text-muted">
          <div>© {new Date().getFullYear()} Bargain Rent-A-Car of America. All rights reserved.</div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/terms" className="hover:text-flame">Terms</Link>
            <Link href="/privacy" className="hover:text-flame">Privacy</Link>
            <a href="https://bargain-admin.advancedmarketing.co" target="_blank" rel="noreferrer" className="hover:text-flame">Staff login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
