"use client";

import { useEffect } from "react";
import Link from "next/link";
import MagnetWrap from "@/app/(main)/utility/MagnetWrap";
import type { CalendarEvent } from "@/types/events";

/* ─── Props ──────────────────────────────────────────────────────────────────── */
interface EventCardProps {
  event: CalendarEvent | null;
  onClose: () => void;
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
  "linear-gradient(90deg, var(--color-milk) 0%, var(--color-warm-brown) 100%)";

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

  /* ── PAST EVENT — blurred photo backdrop with "Checkout memories" ── */
  if (event.isPast) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
        style={{ background: "var(--overlay-55)", backdropFilter: "blur(3px)" }}
      >
        <div
          className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row"
          onClick={(e) => e.stopPropagation()}
          style={{ background: "var(--color-milk)", minHeight: 340 }}
        >
          {/* ── Left: text content ── */}
          <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:p-10">
            <MagnetWrap className="self-start">
              <span
                className="inline-block rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-widest"
                style={{ background: "var(--color-dark-brown)", color: "var(--color-milk)" }}
              >
                {event.subsoc}
              </span>
            </MagnetWrap>

            <h2 className="font-antonio text-2xl font-bold tracking-tight text-dark-brown md:text-5xl">
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
              <p className="text-md leading-relaxed text-mid-brown max-w-xs">
                {event.description}
              </p>
            )}

            <div className="mt-2 flex gap-2">
              {event.galleryHref ? (
                <MagnetWrap>
                  <Link
                    href={event.galleryHref}
                    onClick={onClose}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-milk-yellow bg-dark-brown -translate-x-1 transition-all hover:scale-105 hover:font-bold"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Checkout memories
                  </Link>
                </MagnetWrap>
              ) : (
                <p className="text-xs text-mid-brown uppercase tracking-widest py-2">Gallery coming soon</p>
              )}
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
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, var(--color-milk) 0%, transparent 30%)" }}
            />
          </div>

          {/* Close button */}
          <MagnetWrap className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-milk-yellow bg-milk/80 text-dark-brown transition-all hover:scale-105 hover:bg-milk"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </MagnetWrap>
        </div>
      </div>
    );
  }

  /* ── UPCOMING EVENT — split card: text left, image right ── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
      style={{ background: "var(--overlay-55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--color-milk)", minHeight: 340 }}
      >
        {/* ── Left: text content ── */}
        <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:p-10">
          <MagnetWrap className="self-start">
            <span
              className="inline-block rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-widest"
              style={{ background: "var(--color-dark-brown)", color: "var(--color-milk)" }}
            >
              {event.subsoc}
            </span>
          </MagnetWrap>

          <h2
            className="font-antonio text-2xl font-bold tracking-tight text-dark-brown md:text-5xl"
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
            <p className="text-md leading-relaxed text-mid-brown max-w-xs">
              {event.description}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <MagnetWrap>
              <button
                onClick={onClose}
                className="rounded-full px-5 py-2 text-sm font-medium text-dark-brown bg-light-brown -translate-x-1 transition-all hover:scale-105 hover:font-bold"
              >
                Close
              </button>
            </MagnetWrap>
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
              background: "linear-gradient(to right, var(--color-milk) 0%, transparent 30%)",
            }}
          />
        </div>

        {/* Close button */}
        <MagnetWrap className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-milk-yellow bg-milk/80 text-dark-brown transition-all hover:scale-105 hover:bg-milk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </MagnetWrap>
      </div>
    </div>
  );
}
