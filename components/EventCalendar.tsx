"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import EventCard from "./EventCard";
import type { CalendarEvent } from "@/types/events";
import { motion, useInView } from "framer-motion";

/* ─── Hand-drawn SVG markers ─────────────────────────────────────────────────
   pathLength on motion.path — the ONLY element that supports it.
────────────────────────────────────────────────────────────────────────────── */

function p(isInView: boolean, delay: number) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: isInView ? 1 : 0, opacity: isInView ? 1 : 0 },
    transition: {
      duration: 0.6,
      ease: "easeInOut" as const,
      delay,
      opacity: { duration: 0, delay },
    },
  };
}

function HandCircle({ delay = 0, isInView = false }: { delay?: number; isInView?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <motion.path
        d="M10 4 C30 6 43 10 40 23 C40 34 35 43 24 43 C10 43 5 35 5 24 C5 13 12 5 24 2"
        stroke="var(--color-red)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"
        {...p(isInView, delay)}
      />
    </svg>
  );
}

function HandCircle2({ delay = 0, isInView = false }: { delay?: number; isInView?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <motion.path
        d="M7 6 C34 4 43 12 43 23 C43 34 35 43 24 43 C10 43 5 35 5 24 C5 13 12 5 24 2"
        stroke="var(--color-red)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"
        {...p(isInView, delay)}
      />
    </svg>
  );
}

function HandArrowLeft() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const iv = useInView(ref, { once: true, amount: 0.1 });
  return (
    <span ref={ref}>
      <svg viewBox="0 0 28 28" fill="none" className="h-13 w-13" aria-hidden>
        <motion.path d="M22 14.2 C17.5 13.6 12.5 14.8 7 14" stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0)} />
        <motion.path d="M11.5 9 C9.5 11 7.5 12.8 7 14"        stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0.15)} />
        <motion.path d="M7 14 C7.5 15.5 9.5 17.2 11.5 19"     stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0.25)} />
      </svg>
    </span>
  );
}

function HandArrowRight() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const iv = useInView(ref, { once: true, amount: 0.1 });
  return (
    <span ref={ref}>
      <svg viewBox="0 0 28 28" fill="none" className="h-13 w-13" aria-hidden>
        <motion.path d="M6 14 C10.5 14.8 15.5 13.6 21 14.2" stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0)} />
        <motion.path d="M16.5 9 C18.5 11 20.5 12.8 21 14"    stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0.15)} />
        <motion.path d="M21 14 C20.5 15.5 18.5 17.2 16.5 19" stroke="var(--color-dark-brown)" strokeWidth="2.1" strokeLinecap="round" {...p(iv, 0.25)} />
      </svg>
    </span>
  );
}

function HandX({ delay = 0, isInView = false, done = false }: { delay?: number; isInView?: boolean; done?: boolean }) {
  if (done) return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <path d="M9 11 C22 15 24 24 37 34"  stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" />
      <path d="M43 13 C32 15 24 24 11 37" stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <motion.path d="M9 11 C22 15 24 24 37 34"  stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" {...p(isInView, delay)} />
      <motion.path d="M43 13 C32 15 24 24 11 37" stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" {...p(isInView, delay + 0.2)} />
    </svg>
  );
}

function HandX2({ delay = 0, isInView = false, done = false }: { delay?: number; isInView?: boolean; done?: boolean }) {
  if (done) return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <path d="M8 8 C14 18 28 26 40 38"  stroke="var(--color-red)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40 8 C30 20 20 26 8 40"  stroke="var(--color-red)" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <motion.path d="M8 8 C14 18 28 26 40 38"  stroke="var(--color-red)" strokeWidth="2.2" strokeLinecap="round" {...p(isInView, delay)} />
      <motion.path d="M40 8 C30 20 20 26 8 40"  stroke="var(--color-red)" strokeWidth="2.3" strokeLinecap="round" {...p(isInView, delay + 0.2)} />
    </svg>
  );
}

function HandX3({ delay = 0, isInView = false, done = false }: { delay?: number; isInView?: boolean; done?: boolean }) {
  if (done) return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <path d="M12 9 C18 16 26 26 39 40" stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" />
      <path d="M38 11 C28 17 22 24 9 39"  stroke="var(--color-red)" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      <motion.path d="M12 9 C18 16 26 26 39 40" stroke="var(--color-red)" strokeWidth="2"   strokeLinecap="round" {...p(isInView, delay)} />
      <motion.path d="M38 11 C28 17 22 24 9 39"  stroke="var(--color-red)" strokeWidth="2.3" strokeLinecap="round" {...p(isInView, delay + 0.2)} />
    </svg>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Build a 6-row grid (42 cells) for the given month. */
function buildGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ─── Loading skeleton ──────────────────────────────────────────────────────── */
function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7">
        {Array(42).fill(0).map((_, i) => (
          <div key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

/* ─── EventCalendar ──────────────────────────────────────────────────────────── */
export default function EventCalendar() {
  const [events, setEvents]               = useState<CalendarEvent[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calendarRef = useRef<HTMLElement | null>(null);
  const calendarInView = useInView(calendarRef, { once: true, amount: 0.1 });
  const [xsDone, setXsDone] = useState(false);

  useEffect(() => {
    if (calendarInView && !xsDone) {
      const t = setTimeout(() => setXsDone(true), 1800);
      return () => clearTimeout(t);
    }
  }, [calendarInView, xsDone]);

  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    fetch("/api/events")
      .then((r) => { if (!r.ok) throw new Error("Failed to load events"); return r.json(); })
      .then((data) => { setEvents(data.events ?? []); setLoading(false); })
      .catch((e)  => { setError(e.message); setLoading(false); });
  }, []);

  /* index by date */
  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const existing = eventsByDate.get(ev.date) ?? [];
    eventsByDate.set(ev.date, [...existing, ev]);
  }

  const grid     = buildGrid(viewYear, viewMonth);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const prevMonth = () =>
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; });
  const nextMonth = () =>
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; });
  const goToday = () => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); };

  return (
    <>
      <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      <section id="calendar" ref={calendarRef} className="w-full py-10 px-4">
        <div className="mx-auto w-full max-w-3xl">

          {/* ── Month nav ── */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex h-10 w-10 items-center justify-center text-mid-brown transition-transform hover:scale-110 active:scale-95"
              aria-label="Previous month"
            >
              <HandArrowLeft />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="font-antonio text-3xl font-extrabold uppercase tracking-wide text-dark-brown" style={{ minWidth: 200, textAlign: "center" }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              {(viewYear !== now.getFullYear() || viewMonth !== now.getMonth()) && (
                <button onClick={goToday} className="rounded-full font-antonio bg-milk-yellow px-3 py-1 text-sm font-semibold text-red-brown hover:bg-light-brown/30 transition-colors">
                  LOST?
                </button>
              )}
            </div>

            <button
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center text-mid-brown transition-transform hover:scale-110 active:scale-95"
              aria-label="Next month"
            >
              <HandArrowRight />
            </button>
          </div>

          {/* ── Calendar grid ── */}
          <div
            className="overflow-visible"
            style={{
              position: "relative",
              background: "var(--color-milk)",
              boxShadow: "10px 10px 0 var(--dark-brown-30), -1px -1px 0 var(--dark-brown-06)",
            }}
          >
            {/* Paper texture overlay */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/white-paper-texture.jpg')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                mixBlendMode: "multiply",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: "2px solid var(--dark-brown-30)", background: "var(--color-milk)" }}>
              {DAY_NAMES.map((d, di) => (
                <div
                  key={d}
                  className="font-lato py-2.5 text-center text-sm md:text-lg lg:text-xl font-semibold uppercase tracking-widest text-mid-brown"
                  style={di < 6 ? { borderRight: "1.5px solid var(--dark-brown-18)" } : undefined}
                >
                  {/* Show 1-letter on mobile, full 3-letter on md+ */}
                  <span className="md:hidden">{d[0]}</span>
                  <span className="hidden md:inline">{d}</span>
                </div>
              ))}
            </div>

            {/* Date cells */}
            {loading ? (
              <CalendarSkeleton />
            ) : error ? (
              <p className="py-12 text-center text-sm text-red-400">{error}</p>
            ) : (
              <div className="grid grid-cols-7">
                {grid.map((day, i) => {
                  const col = i % 7;
                  const isLastCol = col === 6;
                  const stagger = col * 0.06 + Math.floor(i / 7) * 0.04;
                  const cellBorder: CSSProperties = {
                    borderRight: isLastCol ? undefined : "1.5px solid var(--dark-brown-15)",
                    borderBottom: "1.5px solid var(--dark-brown-15)",
                  };

                  if (day === null) {
                    return (
                      <div
                        key={`e-${i}`}
                        className="aspect-square"
                        style={{ background: "var(--color-milk)", ...cellBorder }}
                      />
                    );
                  }

                  const key          = toDateKey(viewYear, viewMonth, day);
                  const dayEvents    = eventsByDate.get(key);
                  const isToday      = key === todayKey;
                  const hasUpcoming  = dayEvents?.some((e) => !e.isPast) ?? false;
                  const hasPast      = !hasUpcoming && (dayEvents?.some((e) => e.isPast) ?? false);
                  const primaryEvent = dayEvents
                    ? (dayEvents.find((e) => !e.isPast) ?? dayEvents[0])
                    : null;

                  let cellBg = "var(--color-milk)";
                  if (hasUpcoming) cellBg = "var(--color-event-highlight)";
                  if (hasPast)     cellBg = "var(--color-event-highlight)";

                  return (
                    <div
                      key={key}
                      onClick={() => primaryEvent && setSelectedEvent(primaryEvent)}
                      role={primaryEvent ? "button" : undefined}
                      tabIndex={primaryEvent ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (primaryEvent && (e.key === "Enter" || e.key === " ")) setSelectedEvent(primaryEvent);
                      }}
                      aria-label={primaryEvent ? `${primaryEvent.title} — ${key}` : undefined}
                      className={`relative aspect-square ${primaryEvent ? "hover:brightness-[0.97] cursor-pointer" : "cursor-default"}`}
                      style={{
                        background: cellBg,
                        transition: "background 0.12s",
                        ...cellBorder,
                      }}
                    >
                      {/* Date number */}
                      <span
                        className="absolute left-0 right-0 text-center leading-none"
                        style={{
                          top: 8,
                          fontSize: "clamp(11px, 3vw, 22px)",
                          color: isToday
                            ? "var(--color-red)"
                            : hasUpcoming
                            ? "var(--color-red)"
                            : hasPast
                            ? "var(--color-mid-brown)"
                            : "var(--color-dark-brown)",
                          fontWeight: isToday || hasUpcoming ? 800 : 500,
                          zIndex: 2,
                          position: "absolute",
                        }}
                      >
                        {day}
                      </span>

                      {/* Today underline */}
                      {isToday && (
                        <span
                          className="absolute rounded-full"
                          style={{ top: 30, left: "50%", transform: "translateX(-50%)", height: 2, width: 12, background: "var(--color-red)" }}
                        />
                      )}

                      {/* Hand-drawn markers */}
                      {hasUpcoming && (
                        <span
                          className="absolute"
                          style={{ top: 0, left: "50%", width: 52, height: 52, transform: "translateX(-45%)", zIndex: 1 }}
                        >
                          {day % 2 === 0
                            ? <HandCircle delay={stagger} isInView={calendarInView} />
                            : <HandCircle2 delay={stagger} isInView={calendarInView} />}
                        </span>
                      )}
                      {hasPast && (
                        <span
                          className="absolute"
                          style={{ top: -4, left: "50%", width: 52, height: 52, transform: "translateX(-58%)", zIndex: 1 }}
                        >
                          {day % 3 === 0
                            ? <HandX  delay={stagger} isInView={calendarInView} done={xsDone} />
                            : day % 3 === 1
                            ? <HandX2 delay={stagger} isInView={calendarInView} done={xsDone} />
                            : <HandX3 delay={stagger} isInView={calendarInView} done={xsDone} />}
                        </span>
                      )}

                      {/* Event title — hidden on mobile to save space */}
                      {primaryEvent && (
                        <span
                          className="absolute bottom-1 left-0.5 right-0.5 hidden md:block truncate text-[10px] sm:text-[11px] font-semibold leading-none"
                          style={{ color: "var(--color-red)" }}
                        >
                          {primaryEvent.title}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Legend ── */}
          <div className="mt-3 flex items-center justify-end gap-5 px-1">
            <span className="flex items-center gap-1.5 text-[11px] text-mid-brown">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path d="M12 3 C17 2 22 7 22 12 C22 18 17 22 12 22 C7 22 2 17 2 12 C2 7 7 2 12 3Z"
                  stroke="var(--color-red)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
              Upcoming
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-mid-brown">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path d="M5 5 C8 9 12 12 19 19" stroke="var(--color-red)" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M19 5 C16 9 12 12 5 19" stroke="var(--color-red)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Past event
            </span>
          </div>

        </div>
      </section>
    </>
  );
}