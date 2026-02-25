export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  subsoc: string;
  date: string;        // "YYYY-MM-DD"
  endDate?: string;    // "YYYY-MM-DD"
  time?: string;       // e.g. "06:00 PM"
  imageUrl?: string;   // absolute URL or /public path
  galleryHref?: string; // for past events — link to gallery section
  isPast: boolean;
}
