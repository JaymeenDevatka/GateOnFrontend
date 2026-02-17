import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

function AttendeeTickets({
  tickets,
  onViewTicket,
  onDownloadTicket,
  onCancelBooking,
}) {
  if (!tickets.length) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        You have no upcoming tickets yet. Browse{" "}
        <Link
          to="/events"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          events
        </Link>{" "}
        and grab your spot.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <div
          key={t.id}
          className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card px-4 py-3 flex items-center justify-between hover:border-brand/40 transition"
        >
          <div>
            <Link
              to={`/events/${t.eventId}`}
              className="text-sm font-semibold text-slate-900 hover:text-brand"
            >
              {t.eventTitle}
            </Link>
            <p className="text-xs text-slate-500">
              {t.date} · {t.location}
            </p>
            {t.status && t.status !== "confirmed" && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {t.status}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            <p className="text-xs font-medium text-slate-700">{t.ticketType}</p>
            <p className="text-[11px] text-slate-500">Order #{t.orderNumber}</p>
            <div className="flex items-center justify-end gap-2">
              {onViewTicket && (
                <Button
                  variant="outline"
                  className="text-[11px] px-3 py-1.5"
                  type="button"
                  onClick={() => onViewTicket(t)}
                >
                  View
                </Button>
              )}
              {onDownloadTicket && (
                <Button
                  variant="outline"
                  className="text-[11px] px-3 py-1.5"
                  type="button"
                  onClick={() => onDownloadTicket(t)}
                >
                  Download
                </Button>
              )}
              {onCancelBooking && t.status === "confirmed" && (
                <Button
                  variant="ghost"
                  className="text-[11px] px-3 py-1.5"
                  type="button"
                  onClick={() => onCancelBooking(t)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AttendeeTickets;
