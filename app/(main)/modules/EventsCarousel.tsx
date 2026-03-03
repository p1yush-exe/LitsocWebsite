"use client";

import { useState, useRef, useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import MagnetWrap from "@/app/(main)/utility/MagnetWrap";

interface CarouselVideo {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
}

type CardPos = "center" | "left-1" | "left-2" | "right-1" | "right-2" | "hidden";

const VIDEOS: CarouselVideo[] = [
  { id: "1", youtubeId: "gxEPV4kolz0", title: "LitSoc Showcase 2024", description: "Annual Event" },
  { id: "2", youtubeId: "w_3hALBro5c", title: "Poetry Slam Night",     description: "PoetSoc"      },
  { id: "3", youtubeId: "Z5NoQg8LdDk", title: "DebSoc Grand Finale",  description: "Debate"        },
  { id: "4", youtubeId: "CSvFpBOe8eY", title: "Theatre Performance",  description: "Theatre Soc"  },
  { id: "5", youtubeId: "JQbjS0_ZfJ0", title: "Quiz Championship",    description: "TQC"           },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function EventsCarousel() {
  const videos = VIDEOS;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [nameVisible, setNameVisible] = useState(true);
  const viewportW = useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => window.innerWidth,
    () => 1440,
  );
  const isMobile = viewportW <= 768;
  const [eventsPopped, setEventsPopped] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* per-video iframe unlock (thumbnail-first on both mobile & desktop) */
  const [unlockedVideos, setUnlockedVideos] = useState<Set<number>>(new Set());
  const [userInteracted, setUserInteracted] = useState(false);

  /* desktop center-card hover preview */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverReady, setHoverReady] = useState(false);

  /* mobile: auto-preview after 1s idle on center card */
  const mobilePreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobilePreviewIdx, setMobilePreviewIdx] = useState<number | null>(null);

  /* desktop expand-to-fullscreen */
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandOpen, setExpandOpen] = useState(false);
  const iframeMap = useRef<Map<number, HTMLIFrameElement>>(new Map());

  /* ── Preload all thumbnails into browser cache on mount ── */
  const preloadedImgs = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    preloadedImgs.current = VIDEOS.map((v) => {
      const img = new window.Image();
      img.src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
      return img;
    });
  }, []);

  /* stable refs so interval/rAF never sees stale values */
  const animatingRef      = useRef(animating);
  const currentRef        = useRef(current);
  const videosRef         = useRef(videos);
  const userInteractedRef = useRef(userInteracted);
  const isMobileRef       = useRef(isMobile);
  useLayoutEffect(() => {
    animatingRef.current      = animating;
    currentRef.current        = current;
    videosRef.current         = videos;
    userInteractedRef.current = userInteracted;
    isMobileRef.current       = isMobile;
  });

  /* ── Scroll-in reveal for ghost title — re-runs every time section enters viewport ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setEventsPopped(entry.isIntersecting); },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Auto-advance: mobile + desktop, stops once user interacts ── */
  useEffect(() => {
    if (userInteracted) return;
    const timer = setInterval(() => {
      if (userInteractedRef.current || animatingRef.current) return;
      setAnimating(true);
      setNameVisible(false);
      setCurrent((c) => (c + 1) % videosRef.current.length);
      setTimeout(() => setNameVisible(true), 300);
      setTimeout(() => setAnimating(false), 800);
    }, 3000);
    return () => clearInterval(timer);
  }, [userInteracted]);

  /* ── Mobile: start muted preview after 1s idle on center card ── */
  const mobilePreviewActive = isMobile && !animating && userInteracted;
  useEffect(() => {
    if (!mobilePreviewActive) {
      if (mobilePreviewTimer.current) clearTimeout(mobilePreviewTimer.current);
      return;
    }
    mobilePreviewTimer.current = setTimeout(() => {
      setMobilePreviewIdx(currentRef.current);
      // auto-stop preview after 3.5s
      mobilePreviewTimer.current = setTimeout(() => setMobilePreviewIdx(null), 3500);
    }, 1000);
    return () => { if (mobilePreviewTimer.current) clearTimeout(mobilePreviewTimer.current); };
  }, [mobilePreviewActive, current]);

  /* ── Pause any unlocked iframe by video index ── */
  const pauseVideo = (idx: number) => {
    iframeMap.current.get(idx)?.contentWindow?.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}', "*"
    );
  };

  /* ── Expand a desktop card to full-screen overlay ── */
  const handleExpand = (i: number) => {
    // overlay iframe handles playback — no need to unlock the card
    setUserInteracted(true);
    setEventsPopped(false);
    setNameVisible(false);
    setExpandedIdx(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setExpandOpen(true)));
  };

  /* ── Collapse the expanded overlay ── */
  const handleCollapse = () => {
    if (expandedIdx !== null) pauseVideo(expandedIdx);
    setExpandOpen(false);
    setTimeout(() => {
      setExpandedIdx(null);
      setNameVisible(true);
      setEventsPopped(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setEventsPopped(true)));
    }, 480);
  };

  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.changedTouches[0].screenX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) handleNav(diff > 0 ? 1 : -1);
  };

  const dragStart = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => { dragStart.current = e.clientX; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStart.current === null) return;
    const diff = dragStart.current - e.clientX;
    dragStart.current = null;
    if (Math.abs(diff) > 50) handleNav(diff > 0 ? 1 : -1);
  };

  const handleNav = (dir: number) => {
    if (animating) return;
    setUserInteracted(true);
    pauseVideo(currentRef.current);
    setUnlockedVideos(prev => { const s = new Set(prev); s.delete(currentRef.current); return s; });
    setMobilePreviewIdx(null);
    setAnimating(true);
    setNameVisible(false);
    setCurrent((c) => ((c + dir) % videos.length + videos.length) % videos.length);
    setTimeout(() => setNameVisible(true), 300);
    setTimeout(() => setAnimating(false), 800);
  };

  const goTo = (i: number) => {
    if (animating || i === current) return;
    setUserInteracted(true);
    pauseVideo(current);
    setUnlockedVideos(prev => { const s = new Set(prev); s.delete(current); return s; });
    setMobilePreviewIdx(null);
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

  /* Scales the desktop carousel linearly from 1.0 at 1440 px down to ~0.53 at 768 px */
  const desktopScale = isMobile ? 1 : Math.min(1, viewportW / 1440);
  const cardW = isMobile ? 280 : Math.round(560 * desktopScale);
  const cardH = isMobile ? 158 : Math.round(315 * desktopScale);
  const off1  = Math.round(310 * desktopScale);
  const off2  = Math.round(580 * desktopScale);

  const pos2style: Record<CardPos, React.CSSProperties> = {
    "center":  { zIndex: 10, transform: "scale(1.08) translateZ(0)",                                           opacity: 1,   cursor: "default"  },
    "left-1":  { zIndex:  5, transform: `translateX(-${off1}px) scale(0.82) translateZ(-100px)`,               opacity: 0.9, cursor: "pointer"  },
    "left-2":  { zIndex:  1, transform: `translateX(-${off2}px) scale(0.65) translateZ(-300px)`,               opacity: 0.6, cursor: "pointer"  },
    "right-1": { zIndex:  5, transform: `translateX(${off1}px) scale(0.82) translateZ(-100px)`,                opacity: 0.9, cursor: "pointer"  },
    "right-2": { zIndex:  1, transform: `translateX(${off2}px) scale(0.65) translateZ(-300px)`,                opacity: 0.6, cursor: "pointer"  },
    "hidden":  { zIndex:  0, opacity: 0, pointerEvents: "none", transform: "scale(0.5)"                      },
  };
  const pos2styleMobile: Record<CardPos, React.CSSProperties> = {
    "center":  { zIndex: 10, transform: "scale(1.05)",                    opacity: 1,    cursor: "default"  },
    "left-1":  { zIndex:  6, transform: "translateX(-120px) scale(0.85)", opacity: 0.9,  cursor: "pointer"  },
    "left-2":  { zIndex:  3, transform: "translateX(-220px) scale(0.72)", opacity: 0.65, cursor: "pointer"  },
    "right-1": { zIndex:  6, transform: "translateX(120px) scale(0.85)",  opacity: 0.9,  cursor: "pointer"  },
    "right-2": { zIndex:  3, transform: "translateX(220px) scale(0.72)",  opacity: 0.65, cursor: "pointer"  },
    "hidden":  { zIndex:  0, opacity: 0, pointerEvents: "none", transform: "scale(0.45)" },
  };
  const styleMap = isMobile ? pos2styleMobile : pos2style;

  const trackH = isMobile ? 240 : Math.round(375 * desktopScale);

  return (
    <>
    <section
      id="events-carousel"
      ref={sectionRef}
      className="relative w-full overflow-x-hidden pb-4 md:pb-28"
      style={{ minHeight: isMobile ? trackH + 20 : trackH + 300 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`@keyframes ec-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* ── "OUR EVENTS" ghost title ── */}
      <h1
        className="pointer-events-none absolute left-1/2 whitespace-nowrap font-black uppercase leading-none"
        style={{
          top: isMobile ? 10 : 40,
          transform: eventsPopped
            ? "translateX(-50%) translateY(-20%)"
            : "translateX(-50%) translateY(30%)",
          opacity: eventsPopped ? 1 : 0,
          transition: "transform 0.85s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.6s ease",
          fontSize: isMobile ? "3.5rem" : `${13 * desktopScale}rem`,
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
          marginTop: isMobile ? 2 : Math.round(150 * desktopScale),
          zIndex: 1,
        }}
      >
        {/* Left arrow — desktop only */}
        {!isMobile && (
          <button
            onClick={() => handleNav(-1)}
            className="btn-nav-arrow md:-left-10"
            style={{ background: "transparent", border: "none", fontSize: 70 }}
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        {/* Track */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ transformStyle: "preserve-3d", transform: "translateX(0px)", userSelect: "none" }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {videos.map((video, i) => {
              const pos = getPos(i);
              const isCenter = pos === "center";
              const isUnlocked = unlockedVideos.has(i);
              const isHovered = isCenter && hoverIdx === i;
              const thumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
              const circleR = 70;
              const svgSize = (circleR + 16) * 2;
              const exitStyle: React.CSSProperties = expandedIdx !== null ? (() => {
                const offset = ((i - expandedIdx) + videos.length) % videos.length;
                if (offset === 0) return { opacity: 0, transform: "scale(1.15) translateZ(0)", transition: "opacity 0.45s ease, transform 0.45s ease", pointerEvents: "none" as const };
                const goRight = offset <= Math.floor(videos.length / 2);
                return {
                  transform: `translateX(${goRight ? "" : "-"}180%) scale(0.35) translateZ(0)`,
                  opacity: 0,
                  transition: "transform 0.5s cubic-bezier(0.55,0,1,0.45), opacity 0.35s ease",
                  pointerEvents: "none" as const,
                };
              })() : {};
              const isMobilePreview = isMobile && mobilePreviewIdx === i && isCenter;
              return (
                <div
                  key={video.id}
                  onClick={() => !isCenter && goTo(i)}
                  onMouseEnter={() => {
                    if (isCenter && !isMobile) {
                      setHoverIdx(i);
                      setUserInteracted(true);
                      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                      hoverTimerRef.current = setTimeout(() => {
                        setHoverReady(true);
                        hoverTimerRef.current = setTimeout(() => {
                          setHoverIdx(null);
                          setHoverReady(false);
                        }, 3500);
                      }, 1000);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                    setHoverIdx(null);
                    setHoverReady(false);
                  }}
                  style={{
                    position: "absolute",
                    width: cardW,
                    height: cardH,
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: isCenter ? "0 28px 70px rgba(0,0,0,0.7)" : "0 20px 40px rgba(0,0,0,0.4)",
                    transition: isMobile ? "transform 300ms ease, opacity 250ms ease" : "all 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
                    ...styleMap[pos],
                    ...(isHovered && !isMobile ? { transform: "scale(1.13) translateZ(0)" } : {}),
                    ...exitStyle,
                  }}
                >
                  {/* muted hover-preview — desktop: after 1s delay, mobile: after 1s idle */}
                  {((isCenter && isHovered && hoverReady && !isUnlocked && !isMobile) || isMobilePreview) && (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&rel=0&controls=0&loop=1&playlist=${video.youtubeId}&playsinline=1`}
                      title={`${video.title} preview`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block", pointerEvents: "none" }}
                    />
                  )}
                  {/* iframe stays mounted forever once unlocked — browser keeps it warm */}
                  {isUnlocked && (
                    <iframe
                      ref={(el) => { if (el) iframeMap.current.set(i, el); else iframeMap.current.delete(i); }}
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
                    />
                  )}
                  {/* thumbnail overlay: fades out on hover to reveal preview, hidden once unlocked+centre */}
                  {(!isCenter || !isUnlocked) && (
                    <div
                      style={{
                        position: "absolute", inset: 0,
                        cursor: isCenter ? "pointer" : "default",
                        zIndex: 1,
                        opacity: (isHovered && !isMobile) || isMobilePreview ? 0 : 1,
                        transition: "opacity 0.4s ease",
                      }}
                      onClick={() => { if (isCenter) handleExpand(i); }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={video.title}
                        style={{
                          width: "100%", height: "100%", objectFit: "cover",
                          filter: isCenter ? "blur(3px) brightness(0.75)" : "grayscale(100%) blur(1px)",
                          transition: "filter 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
                        }}
                      />
                      {isCenter && !isMobile && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {/* spinning circular text */}
                          <svg
                            width={svgSize} height={svgSize}
                            viewBox={`0 0 ${svgSize} ${svgSize}`}
                            style={{
                              position: "absolute",
                              animation: "ec-spin 9s linear infinite",
                              transformOrigin: "center",
                              pointerEvents: "none",
                            }}
                          >
                            <defs>
                              <path
                                id={`ctp-${i}`}
                                d={`M ${svgSize / 2},${svgSize / 2} m -${circleR},0 a ${circleR},${circleR} 0 1,1 ${circleR * 2},0 a ${circleR},${circleR} 0 1,1 -${circleR * 2},0`}
                              />
                            </defs>
                            <text fontSize="10.5" fill="rgba(255,255,255,0.88)" letterSpacing="3.5" fontFamily="inherit">
                              <textPath href={`#ctp-${i}`}>
                                {"· PLAY THE VIDEO · PLAY THE VIDEO · PLAY THE VIDEO · PLAY THE VIDEO "}
                              </textPath>
                            </text>
                          </svg>
                          {/* play button */}
                          <div style={{
                            width: 100, height: 100, borderRadius: "50%",
                            background: "rgba(0,0,0,0.65)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backdropFilter: "blur(4px)",
                          }}>
                            <div style={{
                              width: 0, height: 0,
                              borderTop: "20px solid transparent",
                              borderBottom: "20px solid transparent",
                              borderLeft: "32px solid white",
                              marginLeft: 7,
                            }} />
                          </div>
                        </div>
                      )}
                      {isCenter && isMobile && (() => {
                        const mR = 30;
                        const mSvg = (mR + 12) * 2;
                        const mCirc = 2 * Math.PI * mR;
                        return (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {/* spinning circular text — mobile */}
                            <svg
                              width={mSvg} height={mSvg}
                              viewBox={`0 0 ${mSvg} ${mSvg}`}
                              style={{
                                position: "absolute",
                                animation: "ec-spin 9s linear infinite",
                                transformOrigin: "center",
                                pointerEvents: "none",
                              }}
                            >
                              <defs>
                                <path
                                  id={`ctp-m-${i}`}
                                  d={`M ${mSvg / 2},${mSvg / 2} m -${mR},0 a ${mR},${mR} 0 1,1 ${mR * 2},0 a ${mR},${mR} 0 1,1 -${mR * 2},0`}
                                />
                              </defs>
                              <text fontSize="8" fill="rgba(255,255,255,0.88)" fontFamily="inherit">
                                <textPath href={`#ctp-m-${i}`} textLength={mCirc} lengthAdjust="spacing">
                                  {"·PLAY THE VIDEO·PLAY THE VIDEO"}
                                </textPath>
                              </text>
                            </svg>
                            {/* play button */}
                            <div style={{
                              width: 56, height: 56, borderRadius: "50%",
                              background: "rgba(0,0,0,0.6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              backdropFilter: "blur(4px)",
                            }}>
                              <div style={{
                                width: 0, height: 0,
                                borderTop: "12px solid transparent",
                                borderBottom: "12px solid transparent",
                                borderLeft: "20px solid white",
                                marginLeft: 4,
                              }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Right arrow — desktop only */}
        {!isMobile && (
          <button
            onClick={() => handleNav(1)}
            className="btn-nav-arrow md:-right-10"
            style={{ background: "transparent", border: "none", fontSize: 80 }}
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>

      {/* ── Video info below carousel ── */}
      <div
        className="relative -mt-3 md:mt-12 text-center transition-all duration-500"
        style={{ zIndex: 1, opacity: nameVisible && expandedIdx === null ? 1 : 0, width: "100%" }}
      >
        <h2 className="relative inline-block font-bold text-dark-brown" style={{ fontSize: isMobile ? "1.4rem" : undefined, textAlign: "center" }}>
          {!isMobile && <span className="absolute top-1/2 right-full mr-6 h-px w-28 -translate-y-1/2 bg-mid-brown/40" />}
          {videos[current]?.title ?? ""}
          {!isMobile && <span className="absolute top-1/2 left-full ml-6 h-px w-28 -translate-y-1/2 bg-mid-brown/40" />}
        </h2>
        <p className="mt-1 md:mt-3 text-sm uppercase text-mid-brown/70 font-lato" style={{ fontSize: isMobile ? 11 : undefined }}>
          {videos[current]?.description ?? ""}
        </p>
      </div>

      {/* ── Mobile PREV / NEXT + Dots ── */}
      {isMobile && (
        <div style={{ zIndex: 1, opacity: expandedIdx === null ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <button
              onClick={() => handleNav(-1)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3,
                color: "#523122", fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
                textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> PREV
            </button>
            {/* dots */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {videos.map((_v, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                    transition: "all 0.3s ease",
                    background: i === current ? "#a26833" : "rgba(162,104,51,0.2)",
                    transform: i === current ? "scale(1.2)" : "scale(1)",
                    flexShrink: 0,
                  }}
                  aria-label={`Go to video ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => handleNav(1)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3,
                color: "#523122", fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
                textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7,
              }}
            >
              NEXT <span style={{ fontSize: 18, lineHeight: 1 }}>›</span>
            </button>
          </div>
        </div>
      )}
      {/* ── Desktop Dots ── */}
      {!isMobile && (
        <div className="relative mt-8 flex justify-center gap-2" style={{ zIndex: 1, opacity: expandedIdx === null ? 1 : 0, transition: "opacity 0.3s ease" }}>
          {videos.map((_v, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 12, height: 12, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s ease",
                background: i === current ? "#a26833" : "rgba(162,104,51,0.2)",
                transform: i === current ? "scale(1.2)" : "scale(1)",
                flexShrink: 0,
              }}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>
      )}
      {/* ── Fullscreen expand overlay – portalled to <body> to escape
           the preserve-3d / transform stacking context ── */}
    </section>
    {expandedIdx !== null && createPortal(
      <div
        onClick={handleCollapse}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: isMobile ? "rgba(36,22,15,0.85)" : "rgba(82,49,34,0.94)",
          backdropFilter: isMobile ? "blur(18px)" : "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
          opacity: expandOpen ? 1 : 0,
          transition: "opacity 0.45s ease",
          pointerEvents: expandOpen ? "auto" : "none",
        }}
      >
        {isMobile ? (
          /* ── MOBILE fullscreen layout ── */
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            {/* Title + description — slides from top */}
            <div style={{
              textAlign: "center", padding: "0 16px", marginBottom: 14,
              transform: expandOpen ? "translateY(0)" : "translateY(-40px)",
              opacity: expandOpen ? 1 : 0,
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s, opacity 0.4s ease 0.15s",
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#faeade", fontFamily: 'var(--font-antonio), "Antonio", sans-serif' }}>
                {videos[expandedIdx].title}
              </h2>
              <p style={{ fontSize: 12, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(250,234,222,0.6)" }}>
                {videos[expandedIdx].description}
              </p>
            </div>
            {/* Video */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
              <iframe
                ref={(el) => { if (el) iframeMap.current.set(expandedIdx, el); else iframeMap.current.delete(expandedIdx); }}
                src={`https://www.youtube.com/embed/${videos[expandedIdx].youtubeId}?autoplay=1&rel=0&enablejsapi=1&playsinline=1`}
                title={videos[expandedIdx].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 8 }}
              />
              {/* ✕ over the video top-right */}
              <button
                onClick={handleCollapse}
                aria-label="Close video"
                style={{
                  position: "absolute", top: 8, right: 8, zIndex: 2,
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(250,234,222,0.18)",
                  border: "none",
                  color: "#faeade", fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
              >✕</button>
            </div>
            {/* Prev / Next — bold text links below video */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 24px 0",
            }}>
              <button
                onClick={() => { pauseVideo(expandedIdx); setExpandedIdx((expandedIdx - 1 + videos.length) % videos.length); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  color: "#faeade", fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>‹</span> PREV
              </button>
              <button
                onClick={() => { pauseVideo(expandedIdx); setExpandedIdx((expandedIdx + 1) % videos.length); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  color: "#faeade", fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-antonio), "Antonio", sans-serif',
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}
              >
                NEXT <span style={{ fontSize: 22, lineHeight: 1 }}>›</span>
              </button>
            </div>
            {/* Dots — slide from bottom */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 6, marginTop: 16,
              transform: expandOpen ? "translateY(0)" : "translateY(30px)",
              opacity: expandOpen ? 1 : 0,
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s, opacity 0.4s ease 0.2s",
            }}>
              {videos.map((_v, i) => (
                <button
                  key={i}
                  onClick={() => { pauseVideo(expandedIdx); setExpandedIdx(i); }}
                  style={{
                    width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                    transition: "all 0.3s ease",
                    background: i === expandedIdx ? "#faeade" : "rgba(250,234,222,0.3)",
                    transform: i === expandedIdx ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Go to video ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── DESKTOP fullscreen layout ── */
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", display: "flex", alignItems: "start", gap: 16, width: "90%", maxWidth: 1100 }}
          >
            {/* Video + nav arrows */}
            <div style={{ position: "relative", flex: 1, aspectRatio: "16/9" }}>
              <iframe
                ref={(el) => { if (el) iframeMap.current.set(expandedIdx, el); else iframeMap.current.delete(expandedIdx); }}
                src={`https://www.youtube.com/embed/${videos[expandedIdx].youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                title={videos[expandedIdx].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
              />
              {/* Prev arrow */}
              <button
                onClick={() => { pauseVideo(expandedIdx); setExpandedIdx((expandedIdx - 1 + videos.length) % videos.length); }}
                style={{
                  position: "absolute", left: -72, top: "50%", transform: "translateY(-50%)",
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(250,234,222,0.15)",
                  border: "1.5px solid rgba(250,234,222,0.35)",
                  fontSize: 28, color: "#faeade", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(5px)",
                }}
              >‹</button>
              {/* Next arrow */}
              <button
                onClick={() => { pauseVideo(expandedIdx); setExpandedIdx((expandedIdx + 1) % videos.length); }}
                style={{
                  position: "absolute", right: -72, top: "50%", transform: "translateY(-50%)",
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(250,234,222,0.15)",
                  border: "1.5px solid rgba(250,234,222,0.35)",
                  fontSize: 28, color: "#faeade", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(5px)",
                }}
              >›</button>
            </div>
            {/* Close button to the right of the video */}
            <MagnetWrap strength={0.35} radius={70}>
              <button
                onClick={handleCollapse}
                aria-label="Close video"
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(250,234,222,0.15)",
                  border: "1.5px solid rgba(250,234,222,0.35)",
                  color: "#faeade", fontSize: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(6px)",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >✕</button>
            </MagnetWrap>
          </div>
        )}
      </div>,
      document.body
    )}
    </>
  );
}
