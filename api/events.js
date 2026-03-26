export default async function handler(req, res) {
  const icsUrl = "https://calendar.google.com/calendar/ical/c_26f52e5b01c11dd955d6551e2a8358a79628465beb69acfc01c7f7be56e003ef@group.calendar.google.com/public/basic.ics";

  try {
    const response = await fetch(icsUrl);
    const text = await response.text();

    const events = text.split("BEGIN:VEVENT").slice(1);

    const now = new Date();
    let parsed = [];

    events.forEach(event => {
      const startMatch = event.match(/DTSTART:(\d{8}T\d{6})/);
      const summaryMatch = event.match(/SUMMARY:(.+)/);

      if (startMatch && summaryMatch) {
        const raw = startMatch[1];

        const start = new Date(
          raw.substring(0,4) + "-" +
          raw.substring(4,6) + "-" +
          raw.substring(6,8) + "T" +
          raw.substring(9,11) + ":" +
          raw.substring(11,13) + ":" +
          raw.substring(13,15)
        );

        if (start > now) {
          parsed.push({
            title: summaryMatch[1],
            time: start
          });
        }
      }
    });

    parsed.sort((a,b) => a.time - b.time);

    res.status(200).json(parsed.slice(0,5));

  } catch (err) {
    res.status(500).json({ error: "Failed to load calendar" });
  }
}