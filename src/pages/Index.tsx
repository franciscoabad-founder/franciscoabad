import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import CredentialsBar from '@/components/sections/CredentialsBar';
import LogosInstitucionales from '@/components/sections/LogosInstitucionales';
import ProblemStatement from '@/components/sections/ProblemStatement';
import Stats from '@/components/sections/Stats';
import Services from '@/components/sections/Services';
import Testimonials from '@/components/sections/Testimonials';
import Resources from '@/components/sections/Resources';
import BlogPreview from '@/components/sections/BlogPreview';
import NewsletterCTA from '@/components/sections/NewsletterCTA';
import Footer from '@/components/sections/Footer';

const useScrollReveal = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const Index = () => {
  useScrollReveal();

  return (
    <main className="bg-[hsl(var(--bg-primary))]">
      <Navbar />
      <Hero />
      <CredentialsBar />
      <LogosInstitucionales />
      <ProblemStatement />
      <Stats />
      <Services />
      <Testimonials />
      <Resources />
      <BlogPreview />
      <NewsletterCTA />
      <Footer />
    </main>
  );
};

export default Index;
