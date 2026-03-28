"use client"

import { useCallback, useEffect, useRef, useState } from "react";

const BACK_PROMPTS = ["back to the top?", "another ride?", "from the top?"];

export interface ScrollPromptProps {
  animReady?: boolean;
}

export default function ScrollPrompt({ animReady }: ScrollPromptProps) {
  const [internalAnimReady, setInternalAnimReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(24); // 24px = bottom-6
  const promptRef = useRef<HTMLDivElement>(null);

  // If animReady is not passed, fallback to internal state for backward compatibility
  useEffect(() => {
    if (animReady === undefined) {
      const onLoaded = () => setTimeout(() => setInternalAnimReady(true), 120);
      window.addEventListener("app:loaded", onLoaded, { once: true });
      return () => window.removeEventListener("app:loaded", onLoaded);
    }
  }, [animReady]);

  useEffect(() => {
    let lastScrolled = false;
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
      const nowScrolled = window.scrollY > 80;
      if (lastScrolled && !nowScrolled) setPromptIndex((prev) => (prev + 1) % BACK_PROMPTS.length);
      lastScrolled = nowScrolled;
      setScrolled(nowScrolled);
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
    <div
      ref={promptRef}
      style={{ bottom: bottomOffset }}
      className={[
        "fixed right-4 md:right-8 z-50 flex flex-col items-center gap-3 transition-[bottom]",
        !scrolled ? "soft-bounce" : "",
        (animReady ?? internalAnimReady) ? "litsoc-pop" : "opacity-0",
      ].filter(Boolean).join(" ")}
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
        ].join(" ")}
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
  );
}
