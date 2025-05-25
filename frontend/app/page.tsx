'use client';

import { useEffect } from 'react';
import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import FeaturedCars from '@/components/home/FeaturedCars';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import Footer from '@/components/home/Footer';
import Credits from '@/components/home/Credits';

export default function HomePage() {
  // Update the document title
  useEffect(() => {
    document.title = 'Caraya - Premium Car Rental Service';
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      <section id="home">
        <Hero />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="featured">
        <FeaturedCars />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <Credits />
      <CallToAction />
      <Footer />
    </main>
  );
} 