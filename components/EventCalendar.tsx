"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import type { CSSProperties } from "react";
import EventCard from "./EventCard";
import type { CalendarEvent } from "@/types/events";
import {motion, useInView } from "framer-motion";

/* ─── Hand-drawn SVG markers ─────────────────────────────────────────────────
   Deliberately imperfect paths — irregular wobble to mimic a pen mark on paper.
────────────────────────────────────────────────────────────────────────────── */

type props=
{
  children:ReactNode;
  delay?: number;
};

export function DrawOnView({children, delay=0}:props)
{
  const ref= useRef<SVGGElement | null>(null);
  const isInView= useInView(ref,{once:true,margin:"-10% 0px -10% 0px"});

  return(
    <motion.g
      ref={ref}
      initial={{pathLength:0}}
      animate={isInView ? {pathLength: 1}:{}}
      transition={{duration:1.2, ease:"easeOut",delay}}
      style={{overflow:"visible"}}
    >
      {children}
    </motion.g>
  )
}

function HandCircle() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      {/* Primary stroke — irregular closed path */}
      <DrawOnView delay={0}>
        <motion.path
          d="M24 6 C34 4 43 12 43 23 C43 34 35 43 24 43 C13 43 5 35 5 24 C5 13 12 5 24 6"
          stroke="#a02128" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </DrawOnView>
    </svg>
  );
}

function HandArrowLeft() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="h-13 w-13" aria-hidden>
      {/* Wobbly shaft */}
      <path d="M22 14.2 C17.5 13.6 12.5 14.8 7 14" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Arrowhead — upper leg, slightly curved */}
      <path d="M11.5 9 C9.5 11 7.5 12.8 7 14" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Arrowhead — lower leg */}
      <path d="M7 14 C7.5 15.5 9.5 17.2 11.5 19" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Light secondary pass — pen texture */}
      <path d="M20 13.5 C16 13.2 11 14.2 8 14" stroke="#523122" strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

function HandArrowRight() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="h-13 w-13" aria-hidden>
      {/* Wobbly shaft */}
      <path d="M6 14 C10.5 14.8 15.5 13.6 21 14.2" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Arrowhead — upper leg */}
      <path d="M16.5 9 C18.5 11 20.5 12.8 21 14" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Arrowhead — lower leg */}
      <path d="M21 14 C20.5 15.5 18.5 17.2 16.5 19" stroke="#523122" strokeWidth="2.1" strokeLinecap="round"/>
      {/* Light secondary pass */}
      <path d="M8 14.5 C12 14.2 17 13.5 20 14" stroke="#523122" strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

function HandX() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      {/* Slightly curved main strokes */}
      <path d="M11 11 C16 15 24 24 37 37" stroke="#a02128" strokeWidth="2" strokeLinecap="round" />
      <path d="M37 11 C32 15 24 24 11 37" stroke="#a02128" strokeWidth="2" strokeLinecap="round" />
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
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
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
          <div key={i} style={{ height: 96 }} />
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

      <section id="calendar" className="w-full bg-milk py-10 px-4">
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
              border: "2px solid rgba(82,49,34,0.35)",
              background: "#faeade",
              boxShadow: "3px 4px 0 rgba(82,49,34,0.10), -1px -1px 0 rgba(82,49,34,0.06)",
            }}
          >
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: "2px solid rgba(82,49,34,0.30)", background: "#faeade" }}>
              {DAY_NAMES.map((d, di) => (
                <div
                  key={d}
                  className="font-lato py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-mid-brown"
                  style={di < 6 ? { borderRight: "1.5px solid rgba(82,49,34,0.18)" } : undefined}
                >
                  {d}
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
                  const cellBorder: CSSProperties = {
                    borderRight: isLastCol ? undefined : "1.5px solid rgba(82,49,34,0.15)",
                    borderBottom: "1.5px solid rgba(82,49,34,0.15)",
                  };

                  if (day === null) {
                    return (
                      <div
                        key={`e-${i}`}
                        style={{ height: 96, background: "#faeade", ...cellBorder }}
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

                  /* Subtle background tint for event cells */
                  let cellBg = "#faeade";
                  if (hasUpcoming) cellBg = "#fce8d8";
                  if (hasPast)     cellBg = "#fce8d8";

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
                      style={{
                        position: "relative",
                        height: 96,
                        background: cellBg,
                        cursor: primaryEvent ? "pointer" : "default",
                        transition: "background 0.12s",
                        ...cellBorder,
                      }}
                      className={primaryEvent ? "hover:brightness-[0.97]" : ""}
                    >
                      {/* Date number — centered at top, above event title */}
                      <span
                        className="absolute left-0 right-0 text-center leading-none"
                        style={{
                          top: 14,
                          fontSize: 22,
                          color: isToday
                            ? "#a02128"
                            : hasUpcoming
                            ? "#a02128"
                            : hasPast
                            ? "#a26833"
                            : "#523122",
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
                          style={{ top: 40, left: "50%", transform: "translateX(-50%)", height: 2, width: 16, background: "#a02128" }}
                        />
                      )}

                      {/* Hand-drawn markers — wrapped around the date number */}
                      {hasUpcoming && (
                        <span
                          className="absolute"
                          style={{ top: 2, left: "50%", width: 56, height: 56, transform: "translateX(-50%)", zIndex: 1 }}
                        >
                          <HandCircle />
                        </span>
                      )}
                      {hasPast && (
                        <span
                          className="absolute"
                          style={{ top: 2, left: "50%", width: 56, height: 56, transform: "translateX(-50%)", zIndex: 1 }}
                        >
                          <HandX />
                        </span>
                      )}

                      {/* Tiny event title hint at bottom of cell */}
                      {primaryEvent && (
                        <span
                          className="absolute bottom-1.5 left-1.5 right-1.5 hidden truncate text-[9px] font-medium leading-none sm:block"
                          style={{ color: "#a02128" }}
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
                  stroke="#a02128" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
              Upcoming
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-mid-brown">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path d="M5 5 C8 9 12 12 19 19" stroke="#a02128" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M19 5 C16 9 12 12 5 19" stroke="#a02128" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Past event
            </span>
          </div>


        </div>
      </section>
    </>
  );
}
