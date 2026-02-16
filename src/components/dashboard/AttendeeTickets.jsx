import { Link } from 'react-router-dom';

function AttendeeTickets({ tickets }) {
  if (!tickets.length) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        You have no upcoming tickets yet. Browse{' '}
        <Link to="/events" className="font-semibold text-brand hover:text-brand-dark">
          events
        </Link>{' '}
        and grab your spot.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <Link
          key={t.id}
          to={`/events/${t.eventId}`}
          className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card px-4 py-3 flex items-center justify-between hover:border-brand/40 transition"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{t.eventTitle}</p>
            <p className="text-xs text-slate-500">
              {t.date} · {t.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-700">{t.ticketType}</p>
            <p className="text-[11px] text-slate-500">Order #{t.orderNumber}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default AttendeeTickets;

