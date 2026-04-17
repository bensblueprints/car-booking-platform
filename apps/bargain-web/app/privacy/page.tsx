import { BRAND } from '@/lib/brand';

export const metadata = { title: `Privacy — ${BRAND.short}` };

export default function PrivacyPage() {
  return (
    <section className="container-px py-14 md:py-20">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-display font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        <p className="text-bone-200/80 leading-relaxed">
          {BRAND.name} respects your privacy. This policy explains what we collect, how we use it, and the choices you have.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">What we collect</h2>
        <ul className="list-disc pl-5 space-y-2 text-bone-200/80">
          <li>Contact info (name, email, phone) you provide when booking.</li>
          <li>Payment details processed by our PCI-compliant payment provider (Stripe). We do not store card numbers.</li>
          <li>Driver's license information, verified only at pickup and stored securely.</li>
          <li>Basic analytics (pages visited, device type) to improve the site.</li>
        </ul>

        <h2 className="font-display text-2xl mt-10 mb-3">How we use it</h2>
        <ul className="list-disc pl-5 space-y-2 text-bone-200/80">
          <li>To complete your booking and communicate about your rental.</li>
          <li>To comply with legal requirements (tax, insurance, law enforcement requests).</li>
          <li>To send occasional service updates (you can opt out anytime).</li>
        </ul>

        <h2 className="font-display text-2xl mt-10 mb-3">Who we share with</h2>
        <p className="text-bone-200/80 leading-relaxed">
          We never sell your data. We share only with service providers essential to running the business:
          payment processor, email provider, and — when required — insurance providers or law enforcement.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">Your rights</h2>
        <p className="text-bone-200/80 leading-relaxed">
          You can request access, correction, or deletion of your data at any time by emailing {BRAND.email}.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">Cookies</h2>
        <p className="text-bone-200/80 leading-relaxed">
          We use essential cookies for login/session management and optional analytics cookies. Disabling cookies may
          affect the booking flow.
        </p>

        <h2 className="font-display text-2xl mt-10 mb-3">Contact</h2>
        <p className="text-bone-200/80 leading-relaxed">
          Privacy questions: {BRAND.phone} or {BRAND.email}.
        </p>
      </div>
    </section>
  );
}
