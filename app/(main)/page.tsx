"use client"

import { useState } from "react";

import HeroSection from "./modules/HeroSection";
import EventsCarousel from "./modules/EventsCarousel";
import EventCalendar from "@/components/EventCalendar";
import RouletteSection from "./modules/RouletteSection";
import About from "@/components/About";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollPrompt from "@/components/ScrollPrompt";

/* ─── Home Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const [animReady, setAnimReady] = useState(false);
  return (
    <div className="relative min-h-screen w-full bg-milk">
      <ScrollToTop />
      <HeroSection setAnimReady={setAnimReady} />
      <ScrollPrompt animReady={animReady} />
      <About/>
      <EventsCarousel />
      <EventCalendar />
      <RouletteSection />
    </div>
  );
}
