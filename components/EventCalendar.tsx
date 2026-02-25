"use client";

import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import type { CalendarEvent } from "@/types/events";

/* ─── Hand-drawn SVG markers ─────────────────────────────────────────────────
   Deliberately imperfect paths — irregular wobble to mimic a pen mark on paper.
────────────────────────────────────────────────────────────────────────────── */

function HandCircle() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      {/* Primary stroke — irregular closed path */}
      <path
        d="M24 6 C34 4 43 12 43 23 C43 34 35 43 24 43 C13 43 5 35 5 24 C5 13 12 5 24 6"
        stroke="#e11d48" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Second lighter pass for sketched double-stroke feel */}
      <path
        d="M26 5.5 C37 6 44 15 43 26 C42 37 33 45 22 43.5"
        stroke="#e11d48" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.40"
      />
    </svg>
  );
}

function HandX() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden>
      {/* Slightly curved main strokes */}
      <path d="M11 11 C16 15 24 24 37 37" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M37 11 C32 15 24 24 11 37" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* Short tail strokes — pen-skip texture */}
      <path d="M13 9.5 C15 12 18 16 21 20" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <path d="M35 9.5 C33 12 30 16 27 20" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
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
          <div key={i} style={{ height: 96 }} className="bg-gray-50" />
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

      <section className="w-full bg-[#FAF8F5] py-10 px-4">
        <div className="mx-auto w-full max-w-3xl">

          {/* ── Month nav ── */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-white hover:shadow-sm"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "Georgia,serif", minWidth: 170, textAlign: "center", letterSpacing: "-0.01em" }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              {(viewYear !== now.getFullYear() || viewMonth !== now.getMonth()) && (
                <button onClick={goToday} className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors">
                  Today
                </button>
              )}
            </div>

            <button
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-white hover:shadow-sm"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* ── Calendar grid ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e5e7eb", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
          >
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: "1px solid #e5e7eb" }}>
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400"
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
                  if (day === null) {
                    return (
                      <div
                        key={`e-${i}`}
                        style={{ height: 96, background: "#fafafa" }}
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
                  let cellBg = "#fff";
                  if (hasUpcoming) cellBg = "#fff1f3";
                  if (hasPast)     cellBg = "#f8f8f8";

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
                      }}
                      className={primaryEvent ? "hover:brightness-[0.97]" : ""}
                    >
                      {/* Date number — centered at top, above event title */}
                      <span
                        className="absolute left-0 right-0 text-center leading-none"
                        style={{
                          top: 14,
                          fontSize: 16,
                          color: isToday
                            ? "#6366f1"
                            : hasUpcoming
                            ? "#9f1239"
                            : hasPast
                            ? "#94a3b8"
                            : "#374151",
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
                          style={{ top: 34, left: "50%", transform: "translateX(-50%)", height: 2, width: 14, background: "#6366f1" }}
                        />
                      )}

                      {/* Hand-drawn markers — wrapped around the date number */}
                      {hasUpcoming && (
                        <span
                          className="absolute"
                          style={{ top: 4, left: "50%", width: 44, height: 44, transform: "translateX(-50%)", zIndex: 1 }}
                        >
                          <HandCircle />
                        </span>
                      )}
                      {hasPast && (
                        <span
                          className="absolute"
                          style={{ top: 4, left: "50%", width: 40, height: 40, transform: "translateX(-50%)", zIndex: 1 }}
                        >
                          <HandX />
                        </span>
                      )}

                      {/* Tiny event title hint at bottom of cell */}
                      {primaryEvent && (
                        <span
                          className="absolute bottom-1.5 left-1.5 right-1.5 hidden truncate text-[9px] font-medium leading-none sm:block"
                          style={{ color: hasUpcoming ? "#e11d48" : "#94a3b8" }}
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
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path d="M12 3 C17 2 22 7 22 12 C22 18 17 22 12 22 C7 22 2 17 2 12 C2 7 7 2 12 3Z"
                  stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
              Upcoming
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                <path d="M5 5 C8 9 12 12 19 19" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M19 5 C16 9 12 12 5 19" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Past event
            </span>
          </div>


        </div>
      </section>
    </>
  );
}
