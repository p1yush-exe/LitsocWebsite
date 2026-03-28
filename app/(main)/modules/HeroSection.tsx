"use client"

import Image from "next/image";
import { useEffect } from "react";


export default function HeroSection({ setAnimReady }: { setAnimReady: (ready: boolean) => void }) {
  useEffect(() => {
    const onLoaded = () => setTimeout(() => setAnimReady(true), 120);
    window.addEventListener("app:loaded", onLoaded, { once: true });
    return () => window.removeEventListener("app:loaded", onLoaded);
  }, [setAnimReady]);

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
          className={`ghost-title litsoc-pop text-center font-black uppercase leading-none text-[clamp(6rem,35vw,30rem)] md:text-[clamp(6rem,29vw,30rem)]`}
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
    </section>
  );
}