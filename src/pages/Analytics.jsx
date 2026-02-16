import OrganizerStats from '../components/dashboard/OrganizerStats.jsx';
import { useEventContext } from '../context/EventContext.jsx';

function Analytics() {
  const { events } = useEventContext();

  const stats = {
    liveEvents: events.length,
    ticketsSold: 540,
    revenue: 120000,
    views: 3200
  };

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Analytics & reports</h1>
        <p className="text-sm text-slate-500">
          High-level insights into ticket sales, revenue, and attendee demographics – using mock
          data only.
        </p>
      </div>

      <OrganizerStats stats={stats} />

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Ticket breakdown</h2>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>General admission · 60%</li>
            <li>VIP · 25%</li>
            <li>Student / Early bird · 15%</li>
          </ul>
        </div>
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Audience by location</h2>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>Bengaluru · 40%</li>
            <li>Mumbai · 30%</li>
            <li>Delhi NCR · 20%</li>
            <li>Other · 10%</li>
          </ul>
        </div>
      </section>

      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Download reports</h2>
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
          These buttons are placeholders – wire them to real exports once a backend is connected.
        </p>
      </section>
    </div>
  );
}

export default Analytics;

