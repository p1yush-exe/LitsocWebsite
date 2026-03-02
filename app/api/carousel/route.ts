import { NextResponse } from "next/server";

/**
 * Proxies carousel data from the admin service.
 * This allows the main site to call /api/carousel without exposing
 * the admin domain to the browser.
 */
export async function GET() {
  const adminUrl = process.env.ADMIN_API_URL ?? "http://localhost:3001";

  try {
    const res = await fetch(`${adminUrl}/api/carousel`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`Admin returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("[/api/carousel] Could not fetch from admin, returning fallback:", err);
    // Fallback static data so the main site never breaks
    return NextResponse.json({
      items: [
        { id: "1", youtubeId: "gxEPV4kolz0", title: "LitSoc Showcase 2024", description: "Annual Event" },
        { id: "2", youtubeId: "gxEPV4kolz0", title: "Poetry Slam Night",      description: "PoetSoc"       },
        { id: "3", youtubeId: "gxEPV4kolz0", title: "DebSoc Grand Finale",   description: "Debate"         },
        { id: "4", youtubeId: "gxEPV4kolz0", title: "Theatre Performance",   description: "Theatre Soc"    },
        { id: "5", youtubeId: "gxEPV4kolz0", title: "Quiz Championship",     description: "TQC"            },
      ],
    });
  }
}
