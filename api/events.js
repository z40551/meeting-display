export default async function handler(req, res) {
  const icsUrl = "https://calendar.google.com/calendar/ical/c_b94c83b765b4da0f8788b1d1d8d7b0bd4d0b04b3f4def92c524fd9d08fafb1b5%40group.calendar.google.com/public/basic.ics";

  try {
    const response = await fetch(icsUrl);
    const text = await response.text();

    const events = text.split("BEGIN:VEVENT").slice(1);
    const now = new Date();

    let parsed = [];

    events.forEach(event => {
      const startMatch = event.match(/DTSTART:(\d{8}T\d{6}Z?)/);
      const endMatch = event.match(/DTEND:(\d{8}T\d{6}Z?)/);
      const summaryMatch = event.match(/SUMMARY:(.+)/);

      if (startMatch && endMatch) {
        const rawStart = startMatch[1];
        const rawEnd = endMatch[1];

        const toISO = (raw) =>
          raw.substring(0,4) + "-" +
          raw.substring(4,6) + "-" +
          raw.substring(6,8) + "T" +
          raw.substring(9,11) + ":" +
          raw.substring(11,13) + ":" +
          raw.substring(13,15) +
          (raw.endsWith("Z") ? "Z" : "");

        const start = new Date(toISO(rawStart));
        const end = new Date(toISO(rawEnd));

        if (end > now) {
          parsed.push({
            title: summaryMatch ? summaryMatch[1] : "Busy",
            start: start.toISOString(),
            end: end.toISOString()
          });
        }
      }
    });

    parsed.sort((a,b) => new Date(a.start) - new Date(b.start));

    res.status(200).json(parsed.slice(0,5));

  } catch (err) {
    res.status(500).json({ error: "Failed to load calendar" });
  }
}