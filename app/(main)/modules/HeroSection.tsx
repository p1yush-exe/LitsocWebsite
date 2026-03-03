"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  // Delays the LITSOC pop animation until the page loader has exited.
  const [animReady, setAnimReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // "app:loaded" is dispatched by PageLoader just as it starts to fade out.
    // Add a small extra delay so the animation begins on a clean screen.
    const onLoaded = () => setTimeout(() => setAnimReady(true), 120);
    window.addEventListener("app:loaded", onLoaded, { once: true });
    return () => window.removeEventListener("app:loaded", onLoaded);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="pt-30 relative flex md:min-h-screen w-full flex-col items-center justify-start md:justify-center overflow-hidden pb-3 md:pb-0"
    >
      {/* LITSOC ghost title */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: "20%", zIndex: 0 }}
      >
        <h1
          className={`ghost-title ${animReady ? "litsoc-pop" : "opacity-0"} text-center font-black uppercase leading-none text-[clamp(6rem,35vw,30rem)] md:text-[clamp(6rem,29vw,30rem)]`}
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 86%)",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 86%)",
            whiteSpace: "nowrap",
          }}
        >
          LITSOC
        </h1>
      </div>

      {/* Content: image centred, description below */}
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-8 px-6 py-1 md:py-28 text-center">
        <Image
          src="/group.png"
          alt="Literary Society TIET Group Photo"
          width={900}
          height={600}
          className="w-max lg:pt-1 md:pt-10 max-w-8xl object-cover -mt-5 sm:-mt-20 md:-mt-28 lg:-mt-12 xl:mt-0"
          priority
        />
        <p className="max-w-2xl text-paragraph leading-relaxed text-mid-brown font-lato">
          A confluence of words, ideas, and voices — TIET&apos;s home for poetry,
          debate, theatre, cinema, quizzing, and every form of literary expression.
        </p>

        {/* Scroll cue — inline on mobile, absolute on desktop */}
        <div className={`flex flex-col animate-bounce items-center gap-2 text-dark-brown mt-5 md:hidden transition-opacity duration-500 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <span className="text-[0.6rem] tracking-widest uppercase font-lato">Scroll</span>
          <svg className="h-3.5 w-3.5 -mt-2 animate-pulse " fill="none" viewBox="0 0 30 30" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Scroll cue — desktop only, pinned to bottom */}
      <div className={`hidden translate-y-4 md:flex animate-bounce absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-dark-brown transition-opacity duration-500 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <span className="text-xs tracking-widest uppercase font-lato">Scroll</span>
        <svg className="h-5 w-5 -mt-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
