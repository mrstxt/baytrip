import { AppProvider } from "./store";
import TopTicker from "./components/TopTicker";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Tours from "./components/Tours";
import DomesticTours from "./components/DomesticTours";
import { About, Contact, Faq, Testimonials, ToastHost } from "./components/Sections";
import Footer from "./components/Footer";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-mist font-body text-ink">
        <TopTicker />
        <Navbar />
        <main>
          <Hero />
          <Tours />
          <DomesticTours />
          <About />
          <Testimonials />
          <Faq />
          <Contact />
        </main>
        <Footer />
        <ToastHost />
      </div>
    </AppProvider>
  );
}
