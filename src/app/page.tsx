"use client";

import TopTicker from "@/components/TopTicker";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Tours from "@/components/Tours";
import DomesticTours from "@/components/DomesticTours";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import TourAnalysis from "@/components/TourAnalysis";
import { About, Testimonials, Faq, Contact, ToastHost } from "@/components/Sections";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <TopTicker />
      <Navbar />
      <main>
        <Hero />
        <Tours />
        <DomesticTours />
        <SubscriptionPlans />
        <TourAnalysis />
        <About />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <ToastHost />
    </>
  );
}
