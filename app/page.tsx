"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EventCalendar from "@/components/EventCalendar";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const YOUTUBE_EMBED = "https://www.youtube.com/embed/gxEPV4kolz0";
const videos = Array(5).fill(YOUTUBE_EMBED);

const subsocs = [
  { name: "PoetSoc",               icon: "/poetsoc.png",   href: "/poetsoc",    desc: "Where verses breathe and metaphors bloom." },
  { name: "Anubhooti",             icon: "/anubhooti.png", href: "/anubhooti",  desc: "Celebrating Hindi literature, poetry & culture." },
  { name: "DebSoc",                icon: "/debsoc.png",    href: "/debsoc",     desc: "Sharpening minds through argument and oration." },
  { name: "Punjabi Soc",           icon: "/punjabi.png",   href: "/punjabisoc", desc: "Honouring the vibrant spirit of Punjabi arts." },
  { name: "Muse",                  icon: "/muse.png",      href: "/muse",       desc: "A creative writing collective for prose & fiction." },
  { name: "Thapar Quizzing Club",  icon: "/tqc.png",       href: "/tqc",        desc: "For curious minds who live to quiz." },
  { name: "Cineasts",              icon: "/cineasts.jpg",   href: "/cineasts",   desc: "Exploring cinema as art, language & culture." },
  { name: "Theatre Soc",           icon: "/theatre.png",   href: "/theatre",    desc: "Telling human stories through the power of stage." },
];

const ICON_SIZE = 72;
const NUM_ITEMS = subsocs.length; // 8

/* ─── Video Carousel ─────────────────────────────────────────────────────────── */

const videoData = [
  { title: "LitSoc Showcase 2024",   label: "Annual Event" },
  { title: "Poetry Slam Night",      label: "PoetSoc" },
  { title: "DebSoc Grand Finale",    label: "Debate" },
  { title: "Theatre Performance",    label: "Theatre Soc" },
  { title: "Quiz Championship",      label: "TQC" },
];

type CardPos = "center" | "left-1" | "left-2" | "right-1" | "right-2" | "hidden";

function VideoCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [nameVisible, setNameVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.changedTouches[0].screenX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) handleNav(diff > 0 ? 1 : -1);
  };

  const handleNav = (dir: number) => {
    if (animating) return;
    setAnimating(true);
    setNameVisible(false);
    setCurrent((c) => ((c + dir) % videos.length + videos.length) % videos.length);
    setTimeout(() => setNameVisible(true), 300);
    setTimeout(() => setAnimating(false), 800);
  };

  const goTo = (i: number) => {
    if (animating || i === current) return;
    setAnimating(true);
    setNameVisible(false);
    setCurrent(i);
    setTimeout(() => setNameVisible(true), 300);
    setTimeout(() => setAnimating(false), 800);
  };

  const getPos = (i: number): CardPos => {
    const offset = ((i - current) + videos.length) % videos.length;
    if (offset === 0)                 return "center";
    if (offset === 1)                 return "right-1";
    if (offset === 2)                 return "right-2";
    if (offset === videos.length - 1) return "left-1";
    if (offset === videos.length - 2) return "left-2";
    return "hidden";
  };

  const videoId   = "gxEPV4kolz0";
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  /* card dimensions — 16:9 landscape video */
  const cardW = isMobile ? 300 : 560;
  const cardH = isMobile ? 169 : 315;

  /* per-position styles — offsets scaled to wider cards */
  const pos2style: Record<CardPos, React.CSSProperties> = {
    "center":  { zIndex: 10, transform: "scale(1.08) translateZ(0)",                         opacity: 1,   cursor: "default"  },
    "left-1":  { zIndex:  5, transform: "translateX(-310px) scale(0.82) translateZ(-100px)", opacity: 0.9, cursor: "pointer"  },
    "left-2":  { zIndex:  1, transform: "translateX(-580px) scale(0.65) translateZ(-300px)", opacity: 0.6, cursor: "pointer"  },
    "right-1": { zIndex:  5, transform: "translateX(310px) scale(0.82) translateZ(-100px)",  opacity: 0.9, cursor: "pointer"  },
    "right-2": { zIndex:  1, transform: "translateX(580px) scale(0.65) translateZ(-300px)",  opacity: 0.6, cursor: "pointer"  },
    "hidden":  { zIndex:  0, opacity: 0, pointerEvents: "none", transform: "scale(0.5)"    },
  };
  const pos2styleMobile: Record<CardPos, React.CSSProperties> = {
    "center":  { zIndex: 10, transform: "scale(1.05) translateZ(0)",                         opacity: 1,   cursor: "default" },
    "left-1":  { zIndex:  5, transform: "translateX(-160px) scale(0.82) translateZ(-100px)", opacity: 0.9, cursor: "pointer" },
    "left-2":  { zIndex:  1, transform: "translateX(-290px) scale(0.65) translateZ(-300px)", opacity: 0.6, cursor: "pointer" },
    "right-1": { zIndex:  5, transform: "translateX(160px) scale(0.82) translateZ(-100px)",  opacity: 0.9, cursor: "pointer" },
    "right-2": { zIndex:  1, transform: "translateX(290px) scale(0.65) translateZ(-300px)",  opacity: 0.6, cursor: "pointer" },
    "hidden":  { zIndex:  0, opacity: 0, pointerEvents: "none", transform: "scale(0.5)"    },
  };
  const styleMap = isMobile ? pos2styleMobile : pos2style;

  const trackH = isMobile ? 260 : 375;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAF8F5] pb-28"
      style={{ minHeight: trackH + 300 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── "OUR EVENTS" ghost title ── */}
      <h1
        className="pointer-events-none absolute left-1/2 whitespace-nowrap font-black uppercase leading-none"
        style={{
          top: 40,
          transform: "translateX(-50%)",
          fontSize: isMobile ? "5rem" : "10rem",
          letterSpacing: "-0.02em",
          fontFamily: '"Arial Black","Arial Bold",Arial,sans-serif',
          zIndex: 0,
          background: "linear-gradient(to bottom, rgba(180,200,255,0.55) 25%, rgba(180,200,255,0) 75%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          userSelect: "none",
        }}
      >
        Our Events
      </h1>

      {/* ── Carousel container ── */}
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          maxWidth: 1300,
          height: trackH,
          perspective: "1200px",
          marginTop: isMobile ? 90 : 130,
          zIndex: 1,
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => handleNav(-1)}
          className="absolute left-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-none pb-1 text-2xl text-gray-800 transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.12)" }}
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Track */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {videos.map((_, i) => {
            const pos = getPos(i);
            const isCenter = pos === "center";
            return (
              <div
                key={i}
                onClick={() => !isCenter && goTo(i)}
                style={{
                  position: "absolute",
                  width: cardW,
                  height: cardH,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: isCenter ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 40px rgba(0,0,0,0.4)",
                  transition: "all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
                  ...styleMap[pos],
                }}
              >
                {isCenter ? (
                  <iframe
                    src={`${videos[i]}?autoplay=0&rel=0`}
                    title={`LitSoc video ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt={`Video ${i + 1}`}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: "grayscale(100%)",
                      transition: "all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => handleNav(1)}
          className="absolute right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-none pb-1 text-2xl text-gray-800 transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.12)" }}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* ── Member info below carousel ── */}
      <div
        className="relative mt-12 text-center transition-all duration-500"
        style={{ zIndex: 1, opacity: nameVisible ? 1 : 0 }}
      >
        <h2 className="relative inline-block text-4xl font-bold text-indigo-600 md:text-5xl">
          <span className="absolute top-1/2 right-full mr-6 hidden h-px w-28 -translate-y-1/2 bg-indigo-400/40 md:block" />
          {videoData[current].title}
          <span className="absolute top-1/2 left-full ml-6 hidden h-px w-28 -translate-y-1/2 bg-indigo-400/40 md:block" />
        </h2>
        <p className="mt-3 text-md font-medium uppercase tracking-widest text-gray-400">
          {videoData[current].label}
        </p>
      </div>

      {/* ── Dots ── */}
      <div className="relative mt-8 flex justify-center gap-2.5" style={{ zIndex: 1 }}>
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 12, height: 12,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background: i === current ? "rgb(129,140,248)" : "rgba(99,102,241,0.2)",
              transform: i === current ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`Go to video ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Revolver Panel ────────────────────────────────────────────────────────── */
// All geometry is defined in a 700 × 380 px design space, CSS-scaled to viewport.
const W         = 700;           // design width
const H         = 380;           // design height
const WHEEL_R   = 310;           // icon orbit radius
const CX        = W / 2;         // 350 — wheel centre X
const CY        = -80;           // wheel centre Y: 80 px *above* the container top
const STEP      = 360 / NUM_ITEMS;  // 45° between icons

// 3 visible slot angles — MUST be ±STEP (45°) from centre so adjacent icons always align
const SLOT_DEGS  = [135, 180, 225] as const;
const CENTRE_DEG = 180;

// Convert "degrees from 12-o'clock, clockwise" → standard radians
const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

// Pixel centres of the three holes in design space
const HOLES = SLOT_DEGS.map((a) => ({
  cx: CX + WHEEL_R * Math.cos(toRad(a)),
  cy: CY + WHEEL_R * Math.sin(toRad(a)),
  r : a === CENTRE_DEG ? 42 : 36,
  centre: a === CENTRE_DEG,
}));

type ShotPhase = "idle" | "flash" | "smoke" | "black";

function RouletteWheel() {
  const router = useRouter();

  /* ── Responsive scale ── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
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
  const [rotation, setRotation]     = useState(0);
  const [busy, setBusy]             = useState(false);
  const [shotPhase, setShotPhase]   = useState<ShotPhase>("idle");

  /* ── Refs for latest values inside closures ── */
  const rotRef    = useRef(rotation);
  const animRef   = useRef<number | null>(null);
  const navTarget = useRef("");

  // Keep rotRef in sync after every render so event-handler closures see latest value
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

  /* ── Snap: shortest-path rotation to put `idx` at centre slot ── */
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

  /* ── Fire: 6 fast rotations → shot effect → navigate ── */
  const handleFire = () => {
    if (busy) return;
    navTarget.current = subsocs[centerIdx].href;
    setBusy(true);
    const from = rotRef.current;
    const to   = from + 6 * 360;  // 6 full rotations, lands back on same position
    animateTo(from, to, 560, () => {
      setRotation(to % 360);
      setShotPhase("flash");
      setTimeout(() => setShotPhase("smoke"),  110);
      setTimeout(() => setShotPhase("black"),  420);
      setTimeout(() => router.push(navTarget.current), 980);
    });
  };

  /* ── Step arrows ── */
  const stepLeft = () => {
    if (busy) return;
    const nextIdx = (centerIdx - 1 + NUM_ITEMS) % NUM_ITEMS;
    snapToCenter(nextIdx, rotRef.current);
  };
  const stepRight = () => {
    if (busy) return;
    const nextIdx = (centerIdx + 1) % NUM_ITEMS;
    snapToCenter(nextIdx, rotRef.current);
  };

  /* ── Initial snap on mount so all 3 icons land in holes from the start ── */
  useEffect(() => {
    const idx = nearestTo(0, CENTRE_DEG);
    snapToCenter(idx, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup ── */
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  /* ── Shot overlay styles ── */
  const shotStyle: Record<ShotPhase, React.CSSProperties> = {
    idle:  { opacity: 0, background: "transparent",           transition: "none" },
    flash: { opacity: 1, background: "rgba(255,235,80,0.96)", transition: "none" },
    smoke: { opacity: 1, background: "rgba(15,6,2,0.85)",     transition: "background 0.32s ease, opacity 0.32s ease" },
    black: { opacity: 1, background: "#000",                  transition: "background 0.60s ease" },
  };

  /* ─── Render ─── */
  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5] pb-10 pt-10">

      {/* ── Full-screen shot overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999, ...shotStyle[shotPhase] }}
      />

      {/* ── Background atmosphere ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-rose-300/20 blur-[120px]" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 h-40 w-72 rounded-full bg-indigo-200/20 blur-[80px]" />
      </div>

      {/* ── Headings ── */}
      <div className="relative z-10 text-center px-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
        Our Sub-Societies
        </p>
        <h3
          className="mb-1 text-4xl font-bold text-gray-900 md:text-5xl"
          style={{ fontFamily: "Georgia,serif", letterSpacing: "-0.01em" }}
        >
          Choose your vice
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          Drag to spin&nbsp;&nbsp;·&nbsp;&nbsp;
          click the{" "}
          <span className="text-rose-500 font-medium">loaded chamber</span>{" "}
          to enter
        </p>
      </div>

      {/* ── Outer wrapper — measured for responsive scaling ── */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={stepLeft}
          disabled={busy}
          aria-label="Previous"
          className="absolute left-2 md:left-6 z-50 flex items-center justify-center rounded-full text-gray-700 transition-all hover:scale-110 disabled:opacity-30"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            width: 40, height: 40,
            background: "rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.10)",
            fontSize: 22,
            lineHeight: 1,
            paddingBottom: 2,
          }}
        >
          ‹
        </button>

        {/* Right arrow */}
        <button
          onClick={stepRight}
          disabled={busy}
          aria-label="Next"
          className="absolute right-2 md:right-6 z-50 flex items-center justify-center rounded-full text-gray-700 transition-all hover:scale-110 disabled:opacity-30"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            width: 40, height: 40,
            background: "rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.10)",
            fontSize: 22,
            lineHeight: 1,
            paddingBottom: 2,
          }}
        >
          ›
        </button>

      <div
        ref={wrapRef}
        className="relative mx-auto overflow-hidden"
        style={{ maxWidth: W, width: "100%", height: H * scale }}
      >
        {/* ── Inner design-space div — origin top-centre, scaled to fit ── */}
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
          {/* ── LAYER 1 (z:10): rotating icons ── */}
          {subsocs.map((s, i) => {
            const angleDeg = ((i * STEP + rotation) % 360 + 360) % 360;
            const rad = toRad(angleDeg);
            const x = CX + WHEEL_R * Math.cos(rad) - ICON_SIZE / 2;
            const y = CY + WHEEL_R * Math.sin(rad) - ICON_SIZE / 2;
            if (y + ICON_SIZE < -4 || y > H + 4) return null;
            const isLoaded = i === centerIdx;
            return (
              <div
                key={s.name}
                style={{ position: "absolute", left: x, top: y, width: ICON_SIZE, height: ICON_SIZE, zIndex: 10 }}
              >
                <div
                  className="relative w-full h-full rounded-full overflow-hidden"
                  style={{
                    border: `2px solid ${isLoaded ? "rgba(244,63,94,0.80)" : "rgba(180,170,160,0.55)"}`,
                    background: "#fff",
                    boxShadow: isLoaded
                      ? "0 0 16px rgba(244,63,94,0.35), 0 2px 8px rgba(0,0,0,0.10)"
                      : "0 2px 6px rgba(0,0,0,0.08)",
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

          {/* ── LAYER 2 (z:20): SVG dark panel with 3 punched-out circular holes ── */}
          <svg
            width={W} height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}
          >
            <defs>
              {/* Mask: white = show panel, black = punch hole (transparent) */}
              <mask id="panelHoles">
                <rect width={W} height={H} fill="white" />
                {HOLES.map((h, i) => (
                  <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill="black" />
                ))}
              </mask>
              <radialGradient id="centreHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(244,63,94,0.18)" />
                <stop offset="100%" stopColor="rgba(244,63,94,0)"    />
              </radialGradient>
              <radialGradient id="sideHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.04)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
              </radialGradient>
            </defs>

            {/* Cream panel — holes are transparent due to mask */}
            <rect width={W} height={H} fill="#FAF8F5" mask="url(#panelHoles)" />

            {/* Per-hole decorations */}
            {HOLES.map((h, i) => {
              const accent = h.centre ? "#f43f5e" : "rgba(160,150,140,0.70)";
              const glow   = h.centre ? "url(#centreHalo)" : "url(#sideHalo)";
              return (
                <g key={i}>
                  <circle cx={h.cx} cy={h.cy} r={h.r + 22} fill={glow} />
                  <circle
                    cx={h.cx} cy={h.cy} r={h.r + 9}
                    fill="none"
                    stroke={h.centre ? "rgba(244,63,94,0.10)" : "rgba(0,0,0,0.04)"}
                    strokeWidth={8}
                  />
                  <circle
                    cx={h.cx} cy={h.cy} r={h.r + 2}
                    fill="none" stroke={accent}
                    strokeWidth={h.centre ? 2.2 : 1.4}
                    style={h.centre ? { filter: "drop-shadow(0 0 6px rgba(244,63,94,0.55))" } : undefined}
                  />
                  <circle
                    cx={h.cx} cy={h.cy} r={h.r - 2}
                    fill="none"
                    stroke={h.centre ? "rgba(244,63,94,0.20)" : "rgba(0,0,0,0.06)"}
                    strokeWidth={1}
                  />
                  {h.centre && [0, 90, 180, 270].map((a) => {
                    const ar = a * (Math.PI / 180);
                    const r1 = h.r + 5, r2 = h.r + 15;
                    return (
                      <line
                        key={a}
                        x1={h.cx + r1 * Math.cos(ar)} y1={h.cy + r1 * Math.sin(ar)}
                        x2={h.cx + r2 * Math.cos(ar)} y2={h.cy + r2 * Math.sin(ar)}
                        stroke="#f43f5e" strokeWidth={2} opacity={0.75}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* ── LAYER 3 (z:30): drag surface (excludes arrow area) ── */}
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
            style={{ zIndex: 30, touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />

          {/* ── LAYER 4 (z:40): invisible fire button over centre hole ── */}
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
      </div>{/* end outer relative wrapper */}

      {/* ── Info strip ── */}
      <div className="relative z-10 mt-5 text-center px-4">
        <p className="text-base font-semibold text-gray-900 tracking-wide" style={{ letterSpacing: "0.04em" }}>
          {subsocs[centerIdx].name}
        </p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
          {subsocs[centerIdx].desc}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          pull trigger to enter
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-[#EDE9E3] py-12 text-gray-500">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="LitSoc Logo" width={36} height={36} className="rounded-full opacity-90" />
              <span className="text-sm font-semibold text-gray-800">Literary Society, TIET</span>
            </div>
            <p className="max-w-xs text-center text-xs leading-relaxed md:text-left">
              Fostering literary culture at Thapar Institute of Engineering &amp; Technology, Patiala.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Sub-societies</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
              {subsocs.map((s) => (
                <li key={s.name}>
                  <a href={s.href} className="hover:text-gray-950 transition-colors">{s.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Follow Us</p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 0 1 1.772 1.153 4.92 4.92 0 0 1 1.153 1.772c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.902 4.902 0 0 1-1.772-1.153A4.902 4.902 0 0 1 2.566 19.28c-.163-.46-.35-1.26-.403-2.43C2.105 15.584 2.093 15.204 2.093 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 5.49 2.793c.46-.163 1.26-.35 2.43-.403C9.186 2.175 9.566 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.77.128 4.816.32 3.978.628A7.07 7.07 0 0 0 1.425 2.425 7.07 7.07 0 0 0 .628 4.978C.32 5.816.128 6.77.07 8.052.012 9.332 0 9.741 0 12c0 2.259.012 2.668.07 3.948.058 1.282.25 2.236.558 3.074a7.07 7.07 0 0 0 1.797 2.553 7.07 7.07 0 0 0 2.553 1.797c.838.308 1.792.5 3.074.558C9.332 23.988 9.741 24 12 24c2.259 0 2.668-.012 3.948-.07 1.282-.058 2.236-.25 3.074-.558a7.07 7.07 0 0 0 2.553-1.797 7.07 7.07 0 0 0 1.797-2.553c.308-.838.5-1.792.558-3.074C23.988 14.668 24 14.259 24 12c0-2.259-.012-2.668-.07-3.948-.058-1.282-.25-2.236-.558-3.074a7.07 7.07 0 0 0-1.797-2.553A7.07 7.07 0 0 0 19.022.628C18.184.32 17.23.128 15.948.07 14.668.012 14.259 0 12 0z" />
                  <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Literary Society, Thapar Institute of Engineering &amp; Technology. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ─── Home Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const heroRef   = useRef<HTMLElement>(null);
  const litsocRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
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
    <div className="min-h-screen w-full" style={{ background: "#FAF8F5" }}>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 60%, #eef0fa 0%, #f5f3ef 55%, #FAF8F5 100%)" }}
      >
        {/* LITSOC ghost title — animated in by GSAP ScrollTrigger */}
        <h1
          ref={litsocRef}
          className="pointer-events-none absolute left-1/2 text-center font-black uppercase leading-none"
          style={{
            top: "20%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(6rem, 19vw, 15rem)",
            letterSpacing: "-0.02em",
            fontFamily: '"Arial Black","Arial Bold",Arial,sans-serif',
            zIndex: 0,
            background: "linear-gradient(to bottom, rgba(104, 144, 252, 0.55) 40%, rgba(156, 181, 251, 0) 80%)",
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
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-28 text-center">
          <Image
            src="/group.png"
            alt="Literary Society TIET Group Photo"
            width={900}
            height={600}
            className="w-full max-w-4xl object-cover"
            priority
          />
          <p className="max-w-2xl text-base leading-relaxed text-gray-500 font-lato">
            A confluence of words, ideas, and voices — TIET&apos;s home for poetry,
            debate, theatre, cinema, quizzing, and every form of literary expression.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Video Carousel ── */}
      <VideoCarousel />

      {/* ── Events Calendar ── */}
      <EventCalendar />

      {/* ── Subsoc Roulette ── */}
      <RouletteWheel />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}


