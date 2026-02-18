import { Link } from "react-router-dom";

function formatDate(dateStr) {
  if (!dateStr) return { day: "—", month: "—", year: "—", full: "—" };
  const d = new Date(dateStr);
  if (isNaN(d)) return { day: "—", month: "—", year: "—", full: dateStr };
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
    full: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function StatusBadge({ status, checkedIn }) {
  if (checkedIn) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      Checked In
    </span>
  );
  if (status === "confirmed") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand">
      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
      Confirmed
    </span>
  );
  if (status === "cancelled") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      Cancelled
    </span>
  );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
      Pending
    </span>
  );
}

function TicketCard({ t, onView, onDownload, onCancel }) {
  const date = formatDate(t.date);
  const isCancelled = t.status === "cancelled";

  return (
    <div className={`relative bg-white rounded-3xl overflow-hidden shadow-md border transition-all hover:shadow-lg ${isCancelled ? "opacity-60 border-slate-200" : "border-slate-200 hover:border-brand/30"}`}>
      {/* Top colored strip */}
      <div className={`h-1.5 w-full ${isCancelled ? "bg-slate-300" : "bg-gradient-to-r from-brand via-purple-500 to-pink-500"}`} />

      <div className="flex flex-col sm:flex-row">
        {/* Left: Date block */}
        <div className={`flex flex-col items-center justify-center px-6 py-5 sm:py-0 sm:min-w-[100px] border-b sm:border-b-0 sm:border-r border-dashed ${isCancelled ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-brand/5"}`}>
          <span className={`text-4xl font-black leading-none ${isCancelled ? "text-slate-400" : "text-brand"}`}>{date.day}</span>
          <span className={`text-sm font-bold mt-0.5 ${isCancelled ? "text-slate-400" : "text-brand/70"}`}>{date.month}</span>
          <span className="text-xs text-slate-400 mt-0.5">{date.year}</span>
        </div>

        {/* Middle: Event info */}
        <div className="flex-1 px-5 py-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <Link
                to={`/events/${t.eventId}`}
                className="text-base font-black text-slate-900 hover:text-brand transition-colors leading-tight block truncate"
              >
                {t.eventTitle}
              </Link>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate">{t.location || "Location TBA"}</span>
              </div>
              {date.time && date.time !== "—" && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{date.time}</span>
                </div>
              )}
            </div>
            <StatusBadge status={t.status} checkedIn={t.checkedInAt} />
          </div>

          {/* Ticket meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 border-t border-dashed border-slate-200 pt-3">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Ticket</span>
              <p className="font-semibold text-slate-900 mt-0.5">{t.ticketType}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Qty</span>
              <p className="font-semibold text-slate-900 mt-0.5">{t.quantity || 1}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Order</span>
              <p className="font-mono font-semibold text-slate-900 mt-0.5 text-[11px]">#{String(t.orderNumber).slice(0, 8).toUpperCase()}</p>
            </div>
            {t.total > 0 && (
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Paid</span>
                <p className="font-semibold text-slate-900 mt-0.5">₹{t.total.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col items-center justify-center gap-2 px-4 py-4 sm:border-l border-t sm:border-t-0 border-dashed border-slate-200 bg-slate-50/50">
          {onView && (
            <button
              type="button"
              onClick={() => onView(t)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-brand/10 text-slate-500 hover:text-brand transition-all group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className="text-[10px] font-bold">View</span>
            </button>
          )}
          {onDownload && !isCancelled && (
            <button
              type="button"
              onClick={() => onDownload(t)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-[10px] font-bold">Save</span>
            </button>
          )}
          {onCancel && t.status === "confirmed" && (
            <button
              type="button"
              onClick={() => onCancel(t)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-[10px] font-bold">Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendeeTickets({ tickets, onViewTicket, onDownloadTicket, onCancelBooking }) {
  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-brand/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No tickets yet</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">You haven't booked any events. Explore upcoming events and grab your spot!</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-brand text-white font-bold px-6 py-3 rounded-xl hover:bg-brand/90 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Browse Events
        </Link>
      </div>
    );
  }

  const upcoming = tickets.filter((t) => t.status !== "cancelled");
  const cancelled = tickets.filter((t) => t.status === "cancelled");

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upcoming · {upcoming.length}</h3>
          {upcoming.map((t) => (
            <TicketCard
              key={t.id}
              t={t}
              onView={onViewTicket}
              onDownload={onDownloadTicket}
              onCancel={onCancelBooking}
            />
          ))}
        </div>
      )}
      {cancelled.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cancelled · {cancelled.length}</h3>
          {cancelled.map((t) => (
            <TicketCard key={t.id} t={t} onView={onViewTicket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AttendeeTickets;
