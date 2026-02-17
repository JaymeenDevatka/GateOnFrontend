import OrganizerStats from "../components/dashboard/OrganizerStats.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useMemo } from "react";

function Analytics() {
  const { events } = useEventContext();
  const { user } = useAuth();
  const { bookings } = useBookingContext();

  const myEvents = useMemo(() => {
    if (!user) return [];
    return events.filter((e) => (e.ownerId ? e.ownerId === user.id : true));
  }, [events, user]);

  const myEventIds = useMemo(
    () => new Set(myEvents.map((e) => String(e.id))),
    [myEvents],
  );
  const confirmed = useMemo(
    () =>
      bookings.filter(
        (b) => myEventIds.has(String(b.eventId)) && b.status === "confirmed",
      ),
    [bookings, myEventIds],
  );

  const ticketsSold = useMemo(
    () => confirmed.reduce((sum, b) => sum + (b.quantity || 0), 0),
    [confirmed],
  );
  const revenue = useMemo(
    () => confirmed.reduce((sum, b) => sum + (b.pricing?.total || 0), 0),
    [confirmed],
  );

  const stats = {
    liveEvents: myEvents.length,
    ticketsSold,
    revenue,
    views: 3200,
  };

  const ticketBreakdown = useMemo(() => {
    const counts = new Map();
    for (const b of confirmed) {
      const event = myEvents.find((e) => String(e.id) === String(b.eventId));
      const ticket = event?.tickets?.find(
        (t) => String(t.id) === String(b.ticketId),
      );
      const key = ticket?.label || ticket?.name || "Ticket";
      counts.set(key, (counts.get(key) || 0) + (b.quantity || 0));
    }
    const total = Array.from(counts.values()).reduce((a, v) => a + v, 0) || 1;
    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [confirmed, myEvents]);

  const audienceByLocation = useMemo(() => {
    const counts = new Map();
    for (const b of confirmed) {
      const event = myEvents.find((e) => String(e.id) === String(b.eventId));
      const loc =
        (event?.location || "Unknown").split("·")[0].trim() || "Unknown";
      counts.set(loc, (counts.get(loc) || 0) + (b.quantity || 0));
    }
    const total = Array.from(counts.values()).reduce((a, v) => a + v, 0) || 1;
    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [confirmed, myEvents]);

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Analytics & reports
        </h1>
        <p className="text-sm text-slate-500">
          High-level insights into ticket sales, revenue, and attendee
          demographics – computed from saved bookings.
        </p>
      </div>

      <OrganizerStats stats={stats} />

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Ticket breakdown
          </h2>
          <ul className="text-xs text-slate-600 space-y-1">
            {ticketBreakdown.map((t) => (
              <li key={t.label}>
                {t.label} · {t.pct}%
              </li>
            ))}
            {!ticketBreakdown.length && <li>No ticket sales yet.</li>}
          </ul>
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Audience by location
          </h2>
          <ul className="text-xs text-slate-600 space-y-1">
            {audienceByLocation.map((l) => (
              <li key={l.label}>
                {l.label} · {l.pct}%
              </li>
            ))}
            {!audienceByLocation.length && <li>No audience data yet.</li>}
          </ul>
        </div>
      </section>

      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Download reports
          </h2>
          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50">
              CSV
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50">
              Excel
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50">
              PDF
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          These buttons are placeholders – wire them to real exports once a
          backend is connected.
        </p>
      </section>
    </div>
  );
}

export default Analytics;
