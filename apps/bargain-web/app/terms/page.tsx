import { BRAND } from '@/lib/brand';

export const metadata = { title: `Terms — ${BRAND.short}` };

export default function TermsPage() {
  return (
    <section className="container-px py-14 md:py-20">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-display font-bold mb-6">Terms of Service</h1>
        <p className="text-muted text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        <h2 className="font-display text-2xl mt-10 mb-3">1. Rental eligibility</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Primary driver must be at least 21 years old and present a valid driver's license, a major credit or debit card
          in their name, and proof of insurance at pickup. Drivers under 25 may be subject to an additional young-driver fee.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">2. Payment & deposits</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Rental fees are charged at the time of booking. A refundable security deposit is held on the primary driver's
          card at pickup and released 2–3 business days after the vehicle is returned in the same condition.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">3. Cancellations</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Free cancellation up to 24 hours before the scheduled pickup time. Cancellations within 24 hours of pickup may
          be subject to a one-day rental charge. No-shows forfeit the full rental fee.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">4. Vehicle use</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Vehicles may be driven only by authorized drivers listed on the rental agreement. Smoking, illegal activities,
          off-road driving, and use for commercial ride-sharing (Uber, Lyft, food delivery) are prohibited unless
          pre-approved in writing.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">5. Fuel & mileage</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Return the vehicle with the same fuel level it had at pickup. If returned with less fuel, a refueling fee plus
          the cost of fuel will be charged. Daily mileage limits, if applicable, are disclosed at booking and on the
          rental agreement.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">6. Damage & liability</h2>
        <p className="text-bone-200/80 leading-relaxed">
          The renter is responsible for any damage occurring during the rental period, up to and including the full
          repair or replacement cost. Coverage options are offered at the counter for renters without personal auto
          insurance.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">7. Contact</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Questions about these terms? Call us at {BRAND.phone} or email {BRAND.email}.
        </p>
      </div>
    </section>
  );
}
