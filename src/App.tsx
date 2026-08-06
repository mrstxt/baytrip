import { useEffect, useState } from "react";
import { AppProvider } from "./store";
import { ToursProvider } from "./toursStore";
import TopTicker from "./components/TopTicker";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Tours from "./components/Tours";
import DomesticTours from "./components/DomesticTours";
import TourAnalyzer from "./components/TourAnalyzer";
import BayClub from "./components/BayClub";
import { About, Contact, Faq, Testimonials, ToastHost } from "./components/Sections";
import Footer from "./components/Footer";
import AdminPanel from "./admin/AdminPanel";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const isAdmin = hash === "#/admin";

  if (isAdmin) {
    return (
      <AppProvider>
        <ToursProvider>
          <div className="min-h-screen bg-surface font-body text-ink">
            <AdminPanel onBack={() => (window.location.hash = "")} />
          </div>
        </ToursProvider>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <ToursProvider>
        <div className="min-h-screen bg-mist font-body text-ink">
          <TopTicker />
          <Navbar />
          <main>
            <Hero />
            <Tours />
            <DomesticTours />
            <TourAnalyzer />
            <BayClub />
            <About />
            <Testimonials />
            <Faq />
            <Contact />
          </main>
          <Footer />
          <ToastHost />
        </div>
      </ToursProvider>
    </AppProvider>
  );
}
