"use client";

import DripComp from "@/app/(main)/utility/DripComp";
import { useCallback, useEffect, useRef, useState } from "react";

const BACK_PROMPTS = ["back to the top?", "another ride?", "from the top?"];

export default function HeroSection() {
  const [animReady, setAnimReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(24);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dispatch app:loaded after fonts/images have had time to paint
    const dispatch = setTimeout(() => window.dispatchEvent(new Event("app:loaded")), 800);
    const onLoaded = () => setTimeout(() => setAnimReady(true), 1200);
    window.addEventListener("app:loaded", onLoaded, { once: true });
    return () => {
      clearTimeout(dispatch);
      window.removeEventListener("app:loaded", onLoaded);
    };
  }, []);

  useEffect(() => {
    let lastScrolled = false;
    const onScroll = () => {
      const footer = document.querySelector("footer");
      if (footer && promptRef.current) {
        const overlap = window.innerHeight - footer.getBoundingClientRect().top;
        setBottomOffset(overlap > 0 ? overlap + 24 : 24);
      }
      const nowScrolled = window.scrollY > 80;
      if (lastScrolled && !nowScrolled)
        setPromptIndex((prev) => (prev + 1) % BACK_PROMPTS.length);
      lastScrolled = nowScrolled;
      setScrolled(nowScrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);
  const scrollSmall = useCallback(() => {
    document.getElementById("events-carousel")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative flex w-full flex-col items-center">
      <DripComp
        ready={animReady}
        snapshotDelay={140}
        className="relative flex md:min-h-screen w-full flex-col items-center justify-start md:justify-center overflow-hidden pb-3 md:pb-0"
      >
        {/* pt-30 moved inside so it doesn't add to min-h-screen */}
        <div className="pt-30 relative w-full flex flex-col items-center justify-start md:justify-center flex-1">

        {/* Ghost title — gradient via background-clip:text */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: "20%", zIndex: 0 }}
        >
          <h1
            className={`${animReady ? "litsoc-pop" : "opacity-0"} text-center font-black uppercase leading-none text-[clamp(6rem,35vw,30rem)] md:text-[clamp(6rem,29vw,30rem)]`}
            style={{
              backgroundImage: "linear-gradient(to bottom, rgb(180, 100, 60) 0%, rgb(102, 60, 41) 50%, rgb(60, 30, 15) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              fontFamily: "var(--font-antonio), Antonio, sans-serif",
              letterSpacing: "-0.02em",
              userSelect: "none",
              whiteSpace: "nowrap",
              WebkitMaskImage: "linear-gradient(to bottom,var(--ghost-text-start) var(--_ghost-from, 40%),var(--ghost-text-end) var(--_ghost-to, 100%))",
              maskImage: "linear-gradient(to bottom,var(--ghost-text-start) var(--_ghost-from, 40%),var(--ghost-text-end) var(--_ghost-to, 100%))",
            }}
          >
            LITSOC
          </h1>
        </div>

        {/* Group photo */}
        <div className="relative z-10 flex flex-col items-center gap-2 md:gap-8 px-6 py-1 md:py-28 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/group.png"
            alt="Literary Society TIET Group Photo"
            width={900}
            height={600}
            className="w-max lg:pt-1 md:pt-10 max-w-8xl object-cover -mt-5 sm:-mt-20 md:-mt-28 lg:-mt-12 xl:mt-0"
          />
        </div>
        </div>
      </DripComp>

      <p className="relative z-10 max-w-2xl text-paragraph leading-relaxed text-mid-brown font-lato text-center px-6 mt-4 md:mt-8 pb-3 md:pb-0">
        A confluence of words, ideas, and voices — TIET&apos;s home for poetry,
        debate, theatre, cinema, quizzing, and every form of literary expression.
      </p>

      <div
        ref={promptRef}
        style={{ bottom: bottomOffset }}
        className={[
          "fixed right-4 md:right-8 z-50 flex flex-col items-center gap-3 transition-[bottom]",
          !scrolled ? "soft-bounce" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="hidden md:block w-px h-16 md:h-24 bg-dark-brown" />
        <span
          className="hidden md:block font-lato text-[0.65rem] md:text-[0.8rem] tracking-[0.15em] uppercase text-dark-brown transition-opacity duration-300"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {scrolled ? BACK_PROMPTS[promptIndex] : "you should try scrolling"}
        </span>
        <button
          onClick={scrolled ? scrollToTop : scrollSmall}
          className="mt-1 flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full border-[1.5px] border-dark-brown text-dark-brown transition-all duration-300 cursor-pointer hover:scale-110 hover:bg-dark-brown hover:text-milk"
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
    </div>
  );
}