"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HeroSection() {
  const heroRef   = useRef<HTMLElement>(null);
  const litsocRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (mobile) {
      if (litsocRef.current) {
        litsocRef.current.style.opacity = "1";
        litsocRef.current.style.transform = "translate(-50%, -50%)";
      }
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        litsocRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=560",
            scrub: 1.2,
            pin: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="pt-30 relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-milk"
    >
      {/* LITSOC ghost title — animated in by GSAP ScrollTrigger */}
      <h1
        ref={litsocRef}
        className="pointer-events-none absolute left-1/2 text-center font-black uppercase leading-none"
        style={{
          top: "20%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(6rem, 29vw, 30rem)",
          letterSpacing: "-0.02em",
          fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
          zIndex: 0,
          background: "linear-gradient(to bottom, var(--ghost-text-start) 40%, var(--ghost-text-end) 80%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          userSelect: "none",
          whiteSpace: "nowrap",
          opacity: 0,
        }}
      >
        LITSOC
      </h1>

      {/* Content: image centred, description below */}
      <div className="relative z-10 flex flex-col items-center gap-2 md:gap-8 px-6 py-4 md:py-28 text-center">
        <Image
          src="/group.png"
          alt="Literary Society TIET Group Photo"
          width={900}
          height={600}
          className="w-max pt-0 md:pt-20 max-w-8xl object-cover -mt-20 md:mt-0"
          priority
        />
        <p className="max-w-2xl text-base leading-relaxed text-gray-500 font-lato">
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
