import HeroSection from "./modules/HeroSection";
import EventsCarousel from "./modules/EventsCarousel";
import EventCalendar from "@/components/EventCalendar";
import RouletteSection from "./modules/RouletteSection";
import About from "@/components/About";
import ScrollToTop from "@/components/ScrollToTop";

/* ─── Home Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-milk">
      <ScrollToTop />
      <HeroSection />
      <EventsCarousel />
      <EventCalendar />
      <RouletteSection />
    </div>
  );
}
