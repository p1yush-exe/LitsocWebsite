import HeroSection from "./modules/HeroSection";
import EventsCarousel from "./modules/EventsCarousel";
import EventCalendar from "@/components/EventCalendar";
import RouletteSection from "./modules/RouletteSection";
import ScrollToTop from "@/components/ScrollToTop";

/* ─── Home Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <ScrollToTop />
      <HeroSection />
      <EventsCarousel />
      <EventCalendar />
      <RouletteSection />
    </div>
  );
}
