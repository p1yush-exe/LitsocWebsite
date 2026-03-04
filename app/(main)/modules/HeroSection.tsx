"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const BACK_PROMPTS = ["back to the top?", "another ride?", "from the top?"];

export default function HeroSection() {
  const [animReady, setAnimReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promptIndex] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(24); // 24px = bottom-6
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onLoaded = () => setTimeout(() => setAnimReady(true), 120);
    window.addEventListener("app:loaded", onLoaded, { once: true });
    return () => window.removeEventListener("app:loaded", onLoaded);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const footer = document.querySelector("footer");
      if (footer && promptRef.current) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = window.innerHeight - footerRect.top;
        if (overlap > 0) {
          setBottomOffset(overlap + 24);
        } else {
          setBottomOffset(24);
        }
      }
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollSmall = useCallback(() => {
    const el = document.getElementById("events-carousel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
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
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 95%)",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 95%)",
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
      </div>

      {/* Side scroll prompt — fixed to bottom-right */}
      <div
        ref={promptRef}
        style={{ bottom: bottomOffset }}
        className="fixed right-4 md:right-8 z-50 flex flex-col items-center gap-3 transition-[bottom]"
      >
        {/* Vertical line — hidden on mobile */}
        <div className="hidden md:block w-px h-16 md:h-24 bg-dark-brown" />

        {/* Vertical text — hidden on mobile */}
        <span
          className="hidden md:block font-lato text-[0.65rem] md:text-[0.8rem] tracking-[0.15em] uppercase text-dark-brown transition-opacity duration-300"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {scrolled ? BACK_PROMPTS[promptIndex] : "you should try scrolling"}
        </span>

        {/* Circle with arrow — bounces on mobile until scrolled */}
        <button
          onClick={scrolled ? scrollToTop : scrollSmall}
          className={[
            "mt-1 flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full",
            "border-[1.5px] border-dark-brown text-dark-brown",
            "transition-all duration-300 cursor-pointer hover:scale-110 hover:bg-dark-brown hover:text-milk",
            // Bounce only on mobile (below md) and only before scrolling
            !scrolled ? "animate-bounce md:animate-none" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={scrolled ? "Scroll to top" : "Scroll down"}
        >
          {scrolled ? (
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          ) : (
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}