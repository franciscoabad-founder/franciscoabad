import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import LogosInstitucionales from '@/components/sections/LogosInstitucionales';
import ProblemStatement from '@/components/sections/ProblemStatement';
import Stats from '@/components/sections/Stats';
import Services from '@/components/sections/Services';
import Testimonials from '@/components/sections/Testimonials';
import Resources from '@/components/sections/Resources';
import BlogPreview from '@/components/sections/BlogPreview';
import NewsletterCTA from '@/components/sections/NewsletterCTA';
import Footer from '@/components/sections/Footer';
import useScrollReveal from '@/hooks/useScrollReveal';

const Index = () => {
  useScrollReveal();

  return (
    <main className="bg-[hsl(var(--bg-primary))]">
      <Helmet>
        <title>Francisco Abad | Systems for Growth</title>
        <meta name="description" content="Founder, operator y estratega. Diseño sistemas para que personas y organizaciones crezcan con claridad y ejecución. Ex Director General del IESS. Fundador de CODEIS." />
      </Helmet>
      <Navbar />
      <Hero />
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
