"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);
  // Delays the LITSOC pop animation until the page loader has exited.
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // "app:loaded" is dispatched by PageLoader just as it starts to fade out.
    // Add a small extra delay so the animation begins on a clean screen.
    const onLoaded = () => setTimeout(() => setAnimReady(true), 120);
    window.addEventListener("app:loaded", onLoaded, { once: true });
    return () => window.removeEventListener("app:loaded", onLoaded);
  }, []);

  return (
    <section
      className="pt-30 relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-milk"
    >
      {/* LITSOC ghost title */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: "20%", zIndex: 0 }}
      >
        <h1
          className={`${animReady ? "litsoc-pop" : "opacity-0"} text-center font-black uppercase leading-none`}
          style={{
            fontSize: isMobile ? "clamp(6rem, 35vw, 30rem)" : "clamp(6rem, 29vw, 30rem)",
            letterSpacing: "-0.02em",
            fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
            background: "linear-gradient(to bottom, var(--ghost-text-start) 40%, var(--ghost-text-end) 80%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          LITSOC
        </h1>
      </div>

      {/* Content: image centred, description below */}
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-8 px-6 py-4 md:py-28 text-center">
        <Image
          src="/group.png"
          alt="Literary Society TIET Group Photo"
          width={900}
          height={600}
          className="w-max md:pt-20 max-w-8xl object-cover -mt-20 md:mt-0"
          priority
        />
        <p className="max-w-2xl text-base leading-relaxed text-dark-brown font-lato">
          A confluence of words, ideas, and voices — TIET&apos;s home for poetry,
          debate, theatre, cinema, quizzing, and every form of literary expression.
        </p>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
        <span className="text-xs tracking-widest uppercase font-lato">Scroll</span>
        <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
