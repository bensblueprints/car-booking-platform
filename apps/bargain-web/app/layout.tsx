import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import './globals.css';

const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Bargain Rent-A-Car of America | Hassle-Free Car Rentals in South Jersey',
    template: '%s | Bargain Rent-A-Car',
  },
  description: 'Family-owned since 1985. SUVs, sedans, minivans and more at honest prices. Same-day rentals, no hidden fees, military discounts. Somerdale, NJ.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bargainrentacarnj.com'),
  openGraph: {
    type: 'website',
    siteName: 'Bargain Rent-A-Car of America',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} dark`}>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoRental',
              name: 'Bargain Rent-A-Car of America',
              telephone: '+1-856-226-4415',
              email: 'bargainrentacarnj@gmail.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '300 N White Horse Pike',
                addressLocality: 'Somerdale',
                addressRegion: 'NJ',
                postalCode: '08083',
                addressCountry: 'US',
              },
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday'], opens: '09:00', closes: '18:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '09:00', closes: '19:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
              ],
              foundingDate: '1985',
              priceRange: '$$',
            }),
          }}
        />
      </body>
    </html>
  );
}
