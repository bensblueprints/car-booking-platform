import Hero from '@/components/sections/Hero';
import Categories from '@/components/sections/Categories';
import WhyUs from '@/components/sections/WhyUs';
import Process from '@/components/sections/Process';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <WhyUs />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
