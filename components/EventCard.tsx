"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { CalendarEvent } from "@/types/events";

/* ─── Props ──────────────────────────────────────────────────────────────────── */
interface EventCardProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

/* ─── Subsoc badge colors ────────────────────────────────────────────────────── */
const SUBSOC_COLORS: Record<string, { bg: string; text: string }> = {
  "PoetSoc":              { bg: "#fce7f3", text: "#9d174d" },
  "Anubhooti":            { bg: "#fef3c7", text: "#92400e" },
  "DebSoc":               { bg: "#dbeafe", text: "#1e40af" },
  "Punjabi Soc":          { bg: "#f3e8ff", text: "#6b21a8" },
  "Muse":                 { bg: "#d1fae5", text: "#065f46" },
  "Thapar Quizzing Club": { bg: "#e0f2fe", text: "#0c4a6e" },
  "Cineasts":             { bg: "#fef9c3", text: "#713f12" },
  "Theatre Soc":          { bg: "#fee2e2", text: "#991b1b" },
  "LitSoc":               { bg: "#ede9fe", text: "#4c1d95" },
};

function subsocColor(subsoc: string) {
  return SUBSOC_COLORS[subsoc] ?? { bg: "#e3d3bc", text: "#523122" };
}

/* ─── Format date for display ────────────────────────────────────────────────── */
function formatDate(dateStr: string, time?: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const base = dt.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return time ? `${base} · ${time}` : base;
}

/* ─── Fallback gradient bg when no image ────────────────────────────────────── */
const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #e3d3bc 0%, #e3a458 100%)";

/* ─── Event Card ─────────────────────────────────────────────────────────────── */
export default function EventCard({ event, onClose }: EventCardProps) {
  // Prevent body scroll while open
  useEffect(() => {
    if (!event) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [event]);

  // Close on Escape
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [event, onClose]);

  if (!event) return null;

  const { bg: badgeBg, text: badgeText } = subsocColor(event.subsoc);

  /* ── PAST EVENT — blurred photo backdrop with "Checkout memories" ── */
  if (event.isPast) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(2px)" }}
      >
        <div
          className="relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ minHeight: 380 }}
        >
          {/* Blurred photo fills everything */}
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "blur(6px) brightness(0.55)", transform: "scale(1.08)" }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: FALLBACK_GRADIENT, filter: "blur(6px) brightness(0.55)" }}
            />
          )}

          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.30) 100%)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-14 gap-5">
            {/* Subsoc badge */}
            <span
              className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
              {event.subsoc}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {event.title}
            </h2>

            <p className="text-sm text-white/70">{formatDate(event.date, event.time)}</p>

            {event.description && (
              <p className="text-sm text-white/60 max-w-sm leading-relaxed">
                {event.description}
              </p>
            )}

            {/* CTA */}
            {event.galleryHref ? (
              <Link
                href={event.galleryHref}
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(6px)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Checkout memories
              </Link>
            ) : (
              <p className="mt-2 text-xs text-white/40 uppercase tracking-widest">Gallery coming soon</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── UPCOMING EVENT — split card: text left, image right ── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#faeade", minHeight: 340 }}
      >
        {/* ── Left: text content ── */}
        <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:p-10">
          <span
            className="inline-block self-start rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: badgeBg, color: badgeText }}
          >
            {event.subsoc}
          </span>

          <h2
            className="font-antonio text-2xl font-bold leading-tight text-dark-brown md:text-3xl"
          >
            {event.title}
          </h2>

          <p className="flex items-center gap-2 text-sm font-medium text-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(event.date, event.time)}
          </p>

          {event.description && (
            <p className="text-sm leading-relaxed text-mid-brown max-w-xs">
              {event.description}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-medium text-dark-brown bg-milk-yellow transition-colors hover:font-bold"
            >
              Close
            </button>
          </div>
        </div>

        {/* ── Right: image ── */}
        <div
          className="relative hidden h-64 w-72 shrink-0 md:block md:h-auto"
          style={{ background: FALLBACK_GRADIENT }}
        >
          {event.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* Subtle left-to-right fade for seamless blend */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, #faeade 0%, transparent 30%)",
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-milk-yellow bg-milk/80 text-dark-brown transition-all hover:scale-110 hover:bg-milk"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
