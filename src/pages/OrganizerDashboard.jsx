import OrganizerStats from '../components/dashboard/OrganizerStats.jsx';
import { useEventContext } from '../context/EventContext.jsx';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function OrganizerDashboard() {
  const { events } = useEventContext();
  const { user } = useAuth();

  const stats = {
    liveEvents: events.length,
    ticketsSold: 540,
    revenue: 120000,
    views: 3200
  };

  return (
    <div className="container-page space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Organizer dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of your events, notifications and exports. You can host and attend events with a single account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Logged in as</p>
              <p className="text-xs font-semibold text-slate-900">
                {user.name || user.email}
              </p>
            </div>
          )}
          <Button as="button">
            <Link to="/create-event">+ New event</Link>
          </Button>
        </div>
      </div>

      <OrganizerStats stats={stats} />

      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Notifications & reminders</h2>
          <div className="flex gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              Email + WhatsApp
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              24h & 1h before
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Toggle which channels EventHive should use once integrated: currently a frontend-only
          control.
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>Email confirmations</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>WhatsApp confirmations</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>24h reminder</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>1h reminder</span>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Your events</h2>
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card divide-y divide-slate-100">
          {events.map((e) => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                <p className="text-xs text-slate-500">
                  {e.date} · {e.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{e.attendees}+ attendees</p>
                <p className="text-[11px] text-slate-400">Click to view event page</p>
              </div>
            </Link>
          ))}
          {!events.length && (
            <p className="px-4 py-4 text-sm text-slate-500">
              You have no events yet. Create one to see it here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default OrganizerDashboard;

