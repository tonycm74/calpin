import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

serve(async (req) => {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return new Response("Missing username parameter", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Resolve username → user_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, venue_name, venue_address")
    .eq("username", username)
    .maybeSingle();

  if (profileError || !profile) {
    return new Response("Venue not found", { status: 404 });
  }

  // 2. Fetch events
  const { data: events, error: eventsError } = await supabase
    .from("event_pages")
    .select("*")
    .eq("user_id", profile.user_id)
    .eq("is_recurring_parent", false)
    .order("start_time", { ascending: true });

  if (eventsError) {
    return new Response("Error fetching events", { status: 500 });
  }

  // 3. Build iCal
  const calName = profile.venue_name
    ? `${escapeICSText(profile.venue_name)}'s Schedule`
    : `${escapeICSText(username)}'s Schedule`;

  const vevents = (events || [])
    .map((event: Record<string, unknown>) => {
      const start = formatDateForICS(new Date(event.start_time as string));
      const end = event.end_time
        ? formatDateForICS(new Date(event.end_time as string))
        : formatDateForICS(
            new Date(
              new Date(event.start_time as string).getTime() + 60 * 60 * 1000
            )
          );

      const lines = [
        "BEGIN:VEVENT",
        `UID:${event.id}@caldrop.com`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeICSText(event.title as string)}`,
      ];

      if (event.description) {
        lines.push(
          `DESCRIPTION:${escapeICSText(event.description as string)}`
        );
      }
      if (event.location) {
        lines.push(`LOCATION:${escapeICSText(event.location as string)}`);
      } else if (profile.venue_address) {
        lines.push(`LOCATION:${escapeICSText(profile.venue_address)}`);
      }
      if (event.category && event.category !== "other") {
        lines.push(`CATEGORIES:${escapeICSText(event.category as string)}`);
      }

      lines.push("END:VEVENT");
      return lines.join("\r\n");
    })
    .join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalDrop//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${username}-schedule.ics"`,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
