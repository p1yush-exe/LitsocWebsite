import { NextResponse } from "next/server";
import type { CalendarEvent } from "@/types/events";

/*  Description metadata helpers  */
// Add these at the top of any Google Calendar event description:
//   Subsoc: PoetSoc
//   Image: https://...
//   Gallery: /gallery#slug

function parseMeta(desc: string, key: string): string | undefined {
  const match = desc?.match(new RegExp(`^${key}:\\s*(.+)`, "im"));
  return match ? match[1].trim() : undefined;
}

function cleanDescription(desc: string): string {
  return (desc || "").replace(/^(subsoc|image|gallery):.+$/gim, "").trim();
}

function normalizeColons(str: string): string {
  return str
    .replace(/\uFF1A/g, ":")   // full-width colon ：
    .replace(/\u2236/g, ":")   // ratio ∶
    .replace(/\u02D0/g, ":")   // modifier letter colon ː
    .replace(/\u200B/g, "")    // zero-width space
    .replace(/\s*:\s*/g, " : "); // normalise spacing around colon
}

/*  Route Handler  */
export async function GET() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey     = process.env.GOOGLE_API_KEY;

  if (!calendarId || !apiKey) {
    return NextResponse.json({
      events: [],
      source: "none",
      message: "Calendar credentials not configured.",
    });
  }

  try {
    const now    = new Date();
    const past   = new Date(now); past.setMonth(past.getMonth() - 3);
    const future = new Date(now); future.setMonth(future.getMonth() + 6);

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/` +
      `${encodeURIComponent(calendarId)}/events` +
      `?key=${apiKey}` +
      `&timeMin=${past.toISOString()}` +
      `&timeMax=${future.toISOString()}` +
      `&singleEvents=true` +
      `&orderBy=startTime` +
      `&maxResults=250`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Calendar API]", res.status, err);
      return NextResponse.json(
        { error: "Google Calendar request failed", detail: err },
        { status: 502 }
      );
    }

    const data = await res.json();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: CalendarEvent[] = (data.items ?? []).map((item: any) => {
      const dateStr: string =
        item.start?.date ?? item.start?.dateTime?.split("T")[0] ?? "";
      const eventDate  = new Date(dateStr + "T00:00:00");
      const isPast     = eventDate < todayMidnight;
      const rawDesc    = item.description ?? "";

      let time: string | undefined;
      if (item.start?.dateTime) {
        time = new Date(item.start.dateTime).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: true,
        });
      }

      const attachment    = item.attachments?.[0];
      const resolvedImage =
        parseMeta(rawDesc, "image") ??
        (attachment?.fileId
          ? `https://drive.google.com/thumbnail?id=${attachment.fileId}&sz=w800`
          : "/logo.png");

      // Parse "Event Name : Subsoc Name" format (handles full-width / Unicode colons)
      const rawSummary = normalizeColons((item.summary ?? "").trim());
      console.log("[Calendar] normalized summary:", JSON.stringify(rawSummary));
      const colonIdx    = rawSummary.indexOf(":");
      const parsedTitle = (colonIdx > 0 ? rawSummary.slice(0, colonIdx) : rawSummary).trim() || "Untitled Event";
      const subsocFromTitle = colonIdx > 0 ? rawSummary.slice(colonIdx + 1).trim() : undefined;

      return {
        id:          item.id,
        title:       parsedTitle,
        description: cleanDescription(rawDesc),
        subsoc:      parseMeta(rawDesc, "subsoc") ?? subsocFromTitle ?? "LitSoc",
        date:        dateStr,
        endDate:     item.end?.date ?? item.end?.dateTime?.split("T")[0],
        time,
        imageUrl:    resolvedImage,
        galleryHref: isPast ? (parseMeta(rawDesc, "gallery") ?? "/gallery") : undefined,
        isPast,
      } satisfies CalendarEvent;
    });

    return NextResponse.json({ events, source: "google" });
  } catch (err) {
    console.error("[Calendar API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
