"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect } from "react";

/* ─── Sub-society data (exported for use in Footer) ─────────────────────── */

export const insta= "https://www.instagram.com/";

export const subsocs = [
  { name: "PoetSoc",               icon: "/poetsoc.png",   href: `${insta}poetsoc.thapar`,    desc: "Where verses breathe and metaphors bloom." },
  { name: "Anubhooti",             icon: "/anubhooti.png", href: `${insta}anubhooti.litsoc`,  desc: "Celebrating Hindi literature, poetry & culture." },
  { name: "DebSoc",                icon: "/debsoc.png",    href: `${insta}debsoc_tiet`,     desc: "Sharpening minds through argument and oration." },
  { name: "Punjabi Soc",           icon: "/punjabi.png",   href: `${insta}punjabi_litsoc`, desc: "Honouring the vibrant spirit of Punjabi arts." },
  { name: "Muse",                  icon: "/muse.png",      href: `${insta}muse.litsoc.thapar`,       desc: "A creative writing collective for prose & fiction." },
  { name: "Thapar Quizzing Club",  icon: "/tqc.png",       href: `${insta}thaparquizzingclub`,        desc: "For curious minds who live to quiz." },
  { name: "Cineastes",             icon: "/cineasts.jpg",  href: `${insta}_cineastes_`,  desc: "Exploring cinema as art, language & culture." },
  { name: "Theatre Soc",           icon: "/theatre.png",   href: `${insta}thapar.theatre.club`,    desc: "Telling human stories through the power of stage." },
];

/* ─── Geometry ────────────────────────────────────────────────────────────── */

const ICON_SIZE  = 100;
const NUM_ITEMS  = subsocs.length; // 8
const W          = 700;
const H          = 380;
const WHEEL_R    = 310;
const CX         = W / 2;
const CY         = -80;
const STEP       = 360 / NUM_ITEMS;
const SLOT_DEGS  = [135, 180, 225] as const;
const CENTRE_DEG = 180;

const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

type ShotPhase = "idle" | "flash" | "smoke" | "black";

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function RouletteSection() {

  /* ── Responsive scale ── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  /* ── Scale-compensated sizes: big on desktop, stay usable on mobile ── */
  const dynIconSize     = Math.max(ICON_SIZE,  Math.round(90 / scale));
  const dynHoleRCentre  = Math.max(60,         Math.round(55 / scale));
  const dynHoleRSide    = Math.max(50,         Math.round(44 / scale));
  const HOLES = SLOT_DEGS.map((a) => ({
    cx: CX + WHEEL_R * Math.cos(toRad(a)),
    cy: CY + WHEEL_R * Math.sin(toRad(a)),
    r : a === CENTRE_DEG ? dynHoleRCentre : dynHoleRSide,
    centre: a === CENTRE_DEG,
  }));

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => setScale(Math.min(1, el.offsetWidth / W));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── State ── */
  const [rotation, setRotation]   = useState(0);
  const [busy, setBusy]           = useState(false);
  const [shotPhase, setShotPhase] = useState<ShotPhase>("idle");

  /* ── Refs ── */
  const rotRef    = useRef(rotation);
  const animRef   = useRef<number | null>(null);
  const navTarget = useRef("");

  useLayoutEffect(() => { rotRef.current = rotation; });

  /* ── Easing ── */
  const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);

  /* ── Find which icon index is nearest to a given slot angle ── */
  const nearestTo = (rot: number, slotDeg: number): number => {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < NUM_ITEMS; i++) {
      const a = ((i * STEP + rot) % 360 + 360) % 360;
      let d = Math.abs(a - slotDeg);
      if (d > 180) d = 360 - d;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  };

  const centerIdx = nearestTo(rotation, CENTRE_DEG);

  /* ── Generic animation helper ── */
  const animateTo = (from: number, to: number, dur: number, onDone?: () => void) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    let t0 = 0;
    const run = (now: number) => {
      if (!t0) t0 = now;
      const t = Math.min((now - t0) / dur, 1);
      setRotation(from + (to - from) * easeOut3(t));
      if (t < 1) { animRef.current = requestAnimationFrame(run); }
      else       { setRotation(to); onDone?.(); }
    };
    animRef.current = requestAnimationFrame(run);
  };

  /* ── Snap to centre ── */
  const snapToCenter = (idx: number, currentRot: number) => {
    const target  = ((CENTRE_DEG - idx * STEP) % 360 + 360) % 360;
    const current = ((currentRot % 360) + 360) % 360;
    let delta = target - current;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    setBusy(true);
    animateTo(currentRot, currentRot + delta, 420, () => setBusy(false));
  };

  /* ── Drag ── */
  const drag = useRef<{ startX: number; startRot: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startRot: rotRef.current };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || busy) return;
    setRotation(drag.current.startRot + (e.clientX - drag.current.startX) * (0.35 / scale));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    const idx = nearestTo(rotRef.current, CENTRE_DEG);
    snapToCenter(idx, rotRef.current);
  };

  /* ── Fire ── */
  const handleFire = () => {
    if (busy) return;
    navTarget.current = subsocs[centerIdx].href;
    setBusy(true);
    const from = rotRef.current;
    const to   = from + 6 * 360;
    animateTo(from, to, 560, () => {
      setRotation(to % 360);
      setShotPhase("flash");
      setTimeout(() => setShotPhase("smoke"),  110);
      setTimeout(() => setShotPhase("black"),  420);
      setTimeout(() => { window.open(navTarget.current, "_blank"); setShotPhase("idle"); setBusy(false); }, 980);
    });
  };

  /* ── Step arrows ── */
  const stepLeft = () => {
    if (busy) return;
    snapToCenter((centerIdx - 1 + NUM_ITEMS) % NUM_ITEMS, rotRef.current);
  };
  const stepRight = () => {
    if (busy) return;
    snapToCenter((centerIdx + 1) % NUM_ITEMS, rotRef.current);
  };

  /* ── Initial snap ── */
  useEffect(() => {
    snapToCenter(nearestTo(0, CENTRE_DEG), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Intro spin when section scrolls into view ── */
  const sectionRef = useRef<HTMLElement>(null);
  const hasPlayedOnce = useRef(false);
  const introSpinning = useRef(false);
  const busyRef = useRef(busy);
  useLayoutEffect(() => { busyRef.current = busy; });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !busyRef.current && !introSpinning.current) {
          introSpinning.current = true;
          const delay = hasPlayedOnce.current ? 0 : 500;
          hasPlayedOnce.current = true;
          setTimeout(() => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            const from = rotRef.current;
            const to = from + 540; // 1.5 full spins
            setBusy(true);
            animateTo(from, to, 1200, () => {
              const finalRot = to % 360;
              setRotation(finalRot);
              const idx = nearestTo(finalRot, CENTRE_DEG);
              snapToCenter(idx, finalRot);
              introSpinning.current = false;
            });
          }, delay);
        }
        // Reset when scrolled away so it plays again next time
        if (!entry.isIntersecting) {
          introSpinning.current = false;
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup ── */
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  /* ── Shot overlay styles ── */
  const shotStyle: Record<ShotPhase, React.CSSProperties> = {
    idle:  { opacity: 0, background: "transparent",              transition: "none" },
    flash: { opacity: 1, background: "var(--flash-yellow)",      transition: "none" },
    smoke: { opacity: 1, background: "var(--smoke-dark)",        transition: "background 0.32s ease, opacity 0.32s ease" },
    black: { opacity: 1, background: "var(--color-black)",       transition: "background 0.60s ease" },
  };

  /* ── Render ── */
  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden pb-10 pt-10">

      {/* Full-screen shot overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999, ...shotStyle[shotPhase] }}
      />

      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-rose-300/20 blur-[120px]" />
      </div>

      {/* Headings */}
      <div className="relative z-10 text-center px-4">
        <p className="section-label">Our Sub-Societies</p>
        <h3 className="section-heading">CHOOSE YOUR VICE</h3>
        <p className="section-hint">
          Drag to spin&nbsp;&nbsp;·&nbsp;&nbsp;
          click the{" "}
          <span className="text-red-brown font-medium">loaded chamber</span>{" "}
          to enter
        </p>
      </div>

      {/* Outer wrapper */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={stepLeft}
          disabled={busy}
          aria-label="Previous"
          className="btn-nav-arrow left-10 md:left-20 text-[40px] md:text-[80px]"
          style={{ background: "transparent", border: "none" }}
        >
          ‹
        </button>

        {/* Right arrow */}
        <button
          onClick={stepRight}
          disabled={busy}
          aria-label="Next"
          className="btn-nav-arrow right-10 md:right-20 text-[40px] md:text-[80px]"
          style={{ background: "transparent", border: "none"}}
        >
          ›
        </button>

        <div
          ref={wrapRef}
          className="relative mx-auto overflow-hidden"
          style={{ maxWidth: W, width: "100%", height: H * scale }}
        >
          <div
            style={{
              position: "absolute",
              width: W,
              height: H,
              left: "50%",
              marginLeft: -W / 2,
              top: 0,
              transformOrigin: "top center",
              transform: `scale(${scale})`,
            }}
          >
            {/* LAYER 1 (z:10): rotating icons */}
            {subsocs.map((s, i) => {
              const angleDeg = ((i * STEP + rotation) % 360 + 360) % 360;
              const rad = toRad(angleDeg);
              const x = CX + WHEEL_R * Math.cos(rad) - dynIconSize / 2;
              const y = CY + WHEEL_R * Math.sin(rad) - dynIconSize / 2;
              if (y + dynIconSize < -4 || y > H + 4) return null;
              const isLoaded = i === centerIdx;
              return (
                <div
                  key={s.name}
                  style={{ position: "absolute", left: x, top: y, width: dynIconSize, height: dynIconSize, zIndex: 10 }}
                >
                  <div
                    className="relative w-full h-full rounded-full overflow-hidden"
                    style={{
                      border: `2px solid ${isLoaded ? "var(--rose-80)" : "var(--stone-55)"}`,
                      background: "var(--color-white)",
                      boxShadow: isLoaded
                        ? "0 0 16px var(--rose-35), 0 2px 8px var(--shadow-10)"
                        : "0 2px 6px var(--shadow-08)",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <Image
                      src={s.icon} alt={s.name} fill
                      className="rounded-full object-cover p-1.5"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}

            {/* LAYER 2 (z:20): SVG dark panel with 3 punched-out holes */}
            <svg
              width={W} height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}
            >
              <defs>
                <mask id="panelHoles">
                  <rect width={W} height={H} fill="white" />
                  {HOLES.map((h, i) => (
                    <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill="black" />
                  ))}
                </mask>
                <radialGradient id="centreHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="var(--roulette-glow)" />
                  <stop offset="100%" stopColor="var(--roulette-glow-end)" />
                </radialGradient>
                <radialGradient id="sideHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="var(--shadow-04)" />
                  <stop offset="100%" stopColor="transparent"    />
                </radialGradient>
              </defs>

              <rect width={W} height={H} fill="var(--color-milk)" mask="url(#panelHoles)" />

              {HOLES.map((h, i) => {
                const accent = h.centre ? "var(--roulette-accent)" : "var(--stone-70)";
                const glow   = h.centre ? "url(#centreHalo)" : "url(#sideHalo)";
                return (
                  <g key={i}>
                    <circle cx={h.cx} cy={h.cy} r={h.r + 22} fill={glow} />
                    <circle cx={h.cx} cy={h.cy} r={h.r + 9} fill="none"
                      stroke={h.centre ? "var(--rose-10)" : "var(--shadow-04)"} strokeWidth={8} />
                    <circle cx={h.cx} cy={h.cy} r={h.r + 2} fill="none" stroke={accent}
                      strokeWidth={h.centre ? 2.2 : 1.4}
                      style={h.centre ? { filter: "drop-shadow(0 0 6px var(--rose-55))" } : undefined} />
                    <circle cx={h.cx} cy={h.cy} r={h.r - 2} fill="none"
                      stroke={h.centre ? "var(--rose-20)" : "var(--shadow-06)"} strokeWidth={1} />
                    {h.centre && [0, 90, 180, 270].map((a) => {
                      const ar = a * (Math.PI / 180);
                      const r1 = h.r + 5, r2 = h.r + 15;
                      return (
                        <line key={a}
                          x1={h.cx + r1 * Math.cos(ar)} y1={h.cy + r1 * Math.sin(ar)}
                          x2={h.cx + r2 * Math.cos(ar)} y2={h.cy + r2 * Math.sin(ar)}
                          stroke="var(--roulette-accent)" strokeWidth={2} opacity={0.75} />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* LAYER 3 (z:30): drag surface */}
            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
              style={{ zIndex: 30, touchAction: "none" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />

            {/* LAYER 4 (z:40): invisible fire button */}
            <button
              onClick={handleFire}
              disabled={busy}
              aria-label={`Enter ${subsocs[centerIdx].name}`}
              style={{
                position: "absolute",
                left:   HOLES[1].cx - HOLES[1].r,
                top:    HOLES[1].cy - HOLES[1].r,
                width:  HOLES[1].r * 2,
                height: HOLES[1].r * 2,
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                cursor: busy ? "default" : "crosshair",
                zIndex: 40,
              }}
            />
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="relative z-10 mt-5 text-center px-4">
        <p className="text-base font-semibold text-dark-brown tracking-wide font-antonio" style={{ letterSpacing: "0.04em" }}>
          {subsocs[centerIdx].name}
        </p>
        <p className="mt-1 text-sm text-mid-brown max-w-xs mx-auto font-lato">
          {subsocs[centerIdx].desc}
        </p>
        <p className="mt-3 font-bold animate-pulse text-[10px] uppercase tracking-[0.3em] text-brown-red font-lato">
          pull trigger to enter
        </p>
      </div>
    </section>
  );
}
