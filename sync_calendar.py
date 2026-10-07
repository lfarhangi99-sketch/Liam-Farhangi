"""Turns a Google Calendar iCal feed into schedule.json (busy blocks only, no event names).
Run by the GitHub Action in .github/workflows/calendar.yml. You can also run it by hand:
    python scripts/sync_calendar.py my_calendar.ics
"""
import datetime as dt, json, os, sys, urllib.request, zoneinfo
import icalendar, recurring_ical_events

TZ = zoneinfo.ZoneInfo("America/New_York")
UTC = dt.timezone.utc

if len(sys.argv) > 1:
    raw = open(sys.argv[1], "rb").read()
else:
    raw = urllib.request.urlopen(os.environ["CALENDAR_ICS_URL"], timeout=60).read()

cal = icalendar.Calendar.from_ical(raw)
now = dt.datetime.now(TZ)
start = (now - dt.timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
end = start + dt.timedelta(days=200)

busy, allday = [], []
for e in recurring_ical_events.of(cal).between(start, end):
    if str(e.get("TRANSP", "OPAQUE")).upper() == "TRANSPARENT":  # events marked "Free" are skipped
        continue
    if str(e.get("STATUS", "")).upper() == "CANCELLED":
        continue
    s = e["DTSTART"].dt
    en = e["DTEND"].dt if e.get("DTEND") else None
    if not isinstance(s, dt.datetime):  # all-day event
        en = en or s + dt.timedelta(days=1)
        allday.append({"s": s.isoformat(), "e": en.isoformat()})
        continue
    s = s if s.tzinfo else s.replace(tzinfo=TZ)
    if en is None:
        en = s + (e["DURATION"].dt if e.get("DURATION") else dt.timedelta(hours=1))
    en = en if (isinstance(en, dt.datetime) and en.tzinfo) else (en.replace(tzinfo=TZ) if isinstance(en, dt.datetime) else s + dt.timedelta(hours=1))
    busy.append([s.astimezone(UTC), en.astimezone(UTC)])

busy.sort()
merged = []
for s, en in busy:  # merge overlapping blocks so only "busy" time is shown
    if merged and s <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], en)
    else:
        merged.append([s, en])

fmt = lambda d: d.strftime("%Y-%m-%dT%H:%MZ")
out = {
    "updated": dt.datetime.now(UTC).strftime("%Y-%m-%dT%H:%MZ"),
    "timezone": "America/New_York",
    "busy": [{"s": fmt(s), "e": fmt(en)} for s, en in merged],
    "allday": sorted({(a["s"], a["e"]) for a in allday}),
}
out["allday"] = [{"s": s, "e": e} for s, e in out["allday"]]
json.dump(out, open("schedule.json", "w"), indent=1)
print("busy blocks:", len(out["busy"]), "| all-day:", len(out["allday"]))
