"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Full-screen loader shown on every page load / reload.
 * – Logo centred with a progress bar below.
 * – Fills to 100 % over ~1.2 s, then fades out.
 * – Fires the custom event "app:loaded" just as it begins to fade, so
 *   other components can delay their entrance animations accordingly.
 */
export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [fading,   setFading]   = useState(false);
  const [gone,     setGone]     = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Lock scroll while loader is visible
    document.body.style.overflow = "hidden";

    const FILL_MS  = 1200; // time to reach 100 %
    const HOLD_MS  =  150; // pause at 100 % before fade
    const FADE_MS  =  450; // CSS transition duration

    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / FILL_MS) * 100);
      setProgress(p);

      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Dispatch so other components can sync their animations
        setTimeout(() => {
          window.dispatchEvent(new Event("app:loaded"));
          setFading(true);
        }, HOLD_MS);

        setTimeout(() => {
          // Restore scroll before unmounting
          document.body.style.overflow = "";
          setGone(true);
        }, HOLD_MS + FADE_MS + 20);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        background:      "var(--color-milk)",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        opacity:         fading ? 0 : 1,
        transition:      "opacity 0.45s ease",
        pointerEvents:   fading ? "none" : "all",
      }}
    >
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="LitSoc"
        width={200}
        height={200}
        className="rounded-full mb-10"
        priority
      />

      {/* Progress bar track */}
      <div
        style={{
          width:        220,
          height:       3,
          background:   "var(--dark-brown-15)",
          borderRadius: 4,
          overflow:     "hidden",
        }}
      >
        {/* Progress bar fill */}
        <div
          style={{
            height:       "100%",
            width:        `${progress}%`,
            background:   "linear-gradient(90deg, var(--color-red-brown), var(--color-mid-brown))",
            borderRadius: 4,
            transition:   "width 0.04s linear",
          }}
        />
      </div>


    </div>
  );
}
