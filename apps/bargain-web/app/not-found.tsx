import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container-px py-32 text-center">
      <div className="font-display text-[8rem] md:text-[12rem] leading-none font-bold bg-gradient-to-br from-flame to-gold bg-clip-text text-transparent">
        404
      </div>
      <h1 className="font-display text-3xl md:text-4xl mt-4 mb-3">Wrong turn.</h1>
      <p className="text-muted max-w-md mx-auto mb-8">
        This page doesn't exist. Let's get you back on the road.
      </p>
      <Link href="/" className="btn-primary mx-auto">
        Back to home <ArrowRight size={16} />
      </Link>
    </section>
  );
}
