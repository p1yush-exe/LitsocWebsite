"use client";

import { useState, useRef, useEffect, useLayoutEffect, useSyncExternalStore } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface CarouselVideo {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
}

type CardPos = "center" | "left-1" | "left-2" | "right-1" | "right-2" | "hidden";
type MobileAnim = { prev: number; dir: 1 | -1; phase: "init" | "run" } | null;

/* ─── Data ────────────────────────────────────────────────────────────────── */

const FALLBACK_VIDEOS: CarouselVideo[] = [
  { id: "1", youtubeId: "gxEPV4kolz0", title: "LitSoc Showcase 2024", description: "Annual Event" },
  { id: "2", youtubeId: "gxEPV4kolz0", title: "Poetry Slam Night",     description: "PoetSoc"      },
  { id: "3", youtubeId: "gxEPV4kolz0", title: "DebSoc Grand Finale",  description: "Debate"        },
  { id: "4", youtubeId: "gxEPV4kolz0", title: "Theatre Performance",  description: "Theatre Soc"  },
  { id: "5", youtubeId: "gxEPV4kolz0", title: "Quiz Championship",    description: "TQC"           },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function EventsCarousel() {
  const [videos, setVideos] = useState<CarouselVideo[]>(FALLBACK_VIDEOS);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [nameVisible, setNameVisible] = useState(true);
  const isMobile = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 768px)").matches,
    () => false,
  );
  const [mobileAnim, setMobileAnim] = useState<MobileAnim>(null);

  /* stable refs so interval/rAF never sees stale values */
  const animatingRef = useRef(animating);
  const currentRef   = useRef(current);
  const videosRef    = useRef(videos);
  useLayoutEffect(() => {
    animatingRef.current = animating;
    currentRef.current   = current;
    videosRef.current    = videos;
  });

  useEffect(() => {
    fetch("/api/carousel")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.items?.length) setVideos(data.items); })
      .catch(() => {/* keep fallback */});
  }, []);

  /* ── Mobile swipe helper (shared by auto-advance + touch + handleNav) ── */
  const triggerMobileSlide = (dir: 1 | -1) => {
    if (animatingRef.current) return;
    const prevIdx = currentRef.current;
    const nextIdx = ((prevIdx + dir) % videosRef.current.length + videosRef.current.length) % videosRef.current.length;
    setAnimating(true);
    setNameVisible(false);
    setMobileAnim({ prev: prevIdx, dir, phase: "init" });
    setCurrent(nextIdx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMobileAnim(a => a ? { ...a, phase: "run" } : null);
        setTimeout(() => {
          setMobileAnim(null);
          setNameVisible(true);
          setAnimating(false);
        }, 480);
      });
    });
  };

  /* ── Mobile auto-advance: one video every 3 s ── */
  useEffect(() => {
    if (!isMobile) return;
    const timer = setInterval(() => triggerMobileSlide(1), 3000);
    return () => clearInterval(timer);
  }, [isMobile]);

  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.changedTouches[0].screenX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (isMobile) { triggerMobileSlide(diff > 0 ? 1 : -1); return; }
      handleNav(diff > 0 ? 1 : -1);
    }
  };

  const handleNav = (dir: number) => {
    if (animating) return;
    if (isMobile) { triggerMobileSlide(dir as 1 | -1); return; }
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

  const cardW = isMobile ? 300 : 560;
  const cardH = isMobile ? 169 : 315;

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
      className="relative w-full overflow-hidden bg-milk pb-0 md:pb-28"
      style={{ minHeight: isMobile ? trackH + 160 : trackH + 300 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── "OUR EVENTS" ghost title ── */}
      <h1
        className="pointer-events-none absolute left-1/2 whitespace-nowrap font-black uppercase leading-none"
        style={{
          top: 40,
          transform: "translateX(-50%)",
          fontSize: isMobile ? "3.5rem" : "10rem",
          letterSpacing: "-0.02em",
          fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
          zIndex: 0,
          background: "linear-gradient(to bottom, var(--ghost-text-start) 50%, var(--ghost-text-end) 80%)",
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
          marginTop: isMobile ? 60 : 150,
          zIndex: 1,
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => handleNav(-1)}
          className="btn-nav-arrow left-3 md:left-5"
          style={{ background: isMobile ? "transparent" : "rgba(0,0,0,0.12)", fontSize: isMobile ? 32 : undefined }}
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Track */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ transformStyle: "preserve-3d", transform: isMobile ? undefined : "translateX(-50px)" }}
        >
          {isMobile ? (
            <div
              style={{
                position: "absolute",
                width: cardW,
                height: cardH,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Outgoing card */}
              {mobileAnim !== null && (() => {
                const vid = videos[mobileAnim.prev];
                const thumb = `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`;
                const exitX = mobileAnim.phase === "run"
                  ? (mobileAnim.dir > 0 ? "-100%" : "100%")
                  : "0%";
                return (
                  <div style={{
                    position: "absolute", inset: 0,
                    transform: `translateX(${exitX})`,
                    transition: mobileAnim.phase === "run" ? "transform 0.45s ease" : "none",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={vid.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                );
              })()}
              {/* Incoming card */}
              {(() => {
                const vid = videos[current];
                const thumb = `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`;
                const enterX = mobileAnim
                  ? mobileAnim.phase === "run"
                    ? "0%"
                    : (mobileAnim.dir > 0 ? "100%" : "-100%")
                  : "0%";
                return (
                  <div style={{
                    position: "absolute", inset: 0,
                    transform: `translateX(${enterX})`,
                    transition: mobileAnim?.phase === "run" ? "transform 0.45s ease" : "none",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={vid.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                );
              })()}
            </div>
          ) : (
            videos.map((video, i) => {
              const pos = getPos(i);
              const isCenter = pos === "center";
              const thumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
              return (
                <div
                  key={video.id}
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
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={video.title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        filter: "grayscale(100%)",
                        transition: "all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => handleNav(1)}
          className="btn-nav-arrow right-3 md:right-5"
          style={{ background: isMobile ? "transparent" : "rgba(0,0,0,0.12)", fontSize: isMobile ? 32 : undefined }}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* ── Video info below carousel ── */}
      <div
        className="relative mt-12 text-center transition-all duration-500"
        style={{ zIndex: 1, opacity: nameVisible ? 1 : 0 }}
      >
        <h2 className="relative inline-block text-4xl font-bold text-indigo-600 md:text-5xl">
          <span className="absolute top-1/2 right-full mr-6 hidden h-px w-28 -translate-y-1/2 bg-indigo-400/40 md:block" />
          {videos[current]?.title ?? ""}
          <span className="absolute top-1/2 left-full ml-6 hidden h-px w-28 -translate-y-1/2 bg-indigo-400/40 md:block" />
        </h2>
        <p className="mt-3 text-md font-medium uppercase tracking-widest text-gray-400 font-lato">
          {videos[current]?.description ?? ""}
        </p>
      </div>

      {/* ── Dots ── */}
      <div className="relative mt-8 flex justify-center gap-2.5" style={{ zIndex: 1 }}>
        {videos.map((_v, i) => (
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
