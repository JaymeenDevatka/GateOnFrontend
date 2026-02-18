import AttendeeTickets from "../components/dashboard/AttendeeTickets.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function openPrintableTicket({ event, booking, ticketLabel }) {
  const safe = (v) => String(v ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>GateOn Ticket – ${safe(event.title)}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
          .ticket { background: white; border-radius: 20px; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
          .strip { height: 6px; background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899); }
          .body { padding: 28px; }
          .event-title { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
          .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
          .divider { border: none; border-top: 2px dashed #e2e8f0; margin: 20px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block; margin-bottom: 4px; }
          .field p { font-size: 14px; font-weight: 700; color: #0f172a; }
          .qr-box { width: 120px; height: 120px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); font-size: 11px; text-align: center; padding: 8px; }
          .bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: #ede9fe; color: #6366f1; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 999px; }
          .print-btn { margin-top: 20px; padding: 12px 20px; background: #6366f1; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; width: 100%; }
          @media print { .print-btn { display: none; } body { background: white; } }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="strip"></div>
          <div class="body">
            <p style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:700;letter-spacing:0.08em;">GATEON · E-TICKET</p>
            <h1 class="event-title">${safe(event.title)}</h1>
            <p class="meta">${safe(event.date)} · ${safe(event.location)}</p>
            <hr class="divider" />
            <div class="grid">
              <div class="field"><label>Booking ID</label><p style="font-family:monospace;font-size:12px;">${safe(booking.id)}</p></div>
              <div class="field"><label>Ticket Type</label><p>${safe(ticketLabel)}</p></div>
              <div class="field"><label>Attendee</label><p>${safe(booking.attendee?.firstName)} ${safe(booking.attendee?.lastName)}</p></div>
              <div class="field"><label>Email</label><p style="font-size:12px;">${safe(booking.attendee?.email)}</p></div>
              <div class="field"><label>Quantity</label><p>${safe(booking.quantity)}</p></div>
              <div class="field"><label>Amount Paid</label><p>₹${safe(booking.pricing?.total || 0)}</p></div>
            </div>
            <hr class="divider" />
            <div class="bottom">
              <div>
                <span class="badge">✓ Confirmed</span>
                <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Show this at entry. Valid for one-time use only.</p>
              </div>
              <div class="qr-box">QR<br/>${safe(booking.id).slice(0, 8)}</div>
            </div>
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

function AttendeeDashboard() {
  const { user } = useAuth();
  const { getBookingsByUser, cancelBooking } = useBookingContext();
  const { getEventById } = useEventContext();
  const [selected, setSelected] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const myBookings = useMemo(
    () => (user ? getBookingsByUser(user.id) : []),
    [getBookingsByUser, user],
  );

  const tickets = useMemo(() => {
    return myBookings.map((b) => {
      const event = getEventById(b.eventId);
      const ticket = event?.tickets?.find((t) => String(t.id) === String(b.ticketId));
      return {
        id: b.id,
        bookingId: b.id,
        eventId: b.eventId,
        eventTitle: event?.title || "Event",
        date: event?.date || "",
        location: event?.location || "",
        category: event?.category || "",
        ticketType: ticket?.label || ticket?.name || "General",
        orderNumber: b.id,
        status: b.status,
        checkedInAt: b.checkedInAt,
        quantity: b.quantity || 1,
        total: b.pricing?.total || 0,
        raw: { booking: b, event, ticket },
      };
    });
  }, [getEventById, myBookings]);

  const confirmed = tickets.filter((t) => t.status === "confirmed");
  const totalSpent = confirmed.reduce((s, t) => s + t.total, 0);

  const handleDownload = (t) => {
    const event = t.raw?.event;
    const booking = t.raw?.booking;
    if (!event || !booking) return;
    openPrintableTicket({ event, booking, ticketLabel: t.ticketType });
  };

  const handleShareWhatsApp = (t) => {
    const event = t.raw?.event;
    if (!event) return;
    const text = `🎟️ My ticket for *${event.title}*\n📅 ${event.date}\n📍 ${event.location}\nBooking ID: ${t.bookingId}\n\nBooked via GateOn`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">My Tickets</h1>
              <p className="text-sm text-slate-500 mt-1">Your event bookings and passes</p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-2 bg-brand text-white font-bold px-4 py-2.5 rounded-xl hover:bg-brand/90 transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Browse Events
            </Link>
          </div>

          {/* Quick stats */}
          {tickets.length > 0 && (
            <div className="flex gap-6 mt-5 pt-5 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900">{tickets.length}</p>
                <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-900">{confirmed.length}</p>
                <p className="text-xs text-slate-500 font-medium">Confirmed</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-900">₹{totalSpent.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium">Total Spent</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tickets */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AttendeeTickets
          tickets={tickets}
          onViewTicket={(t) => setSelected(t)}
          onDownloadTicket={handleDownload}
          onCancelBooking={(t) => setCancelConfirm(t)}
        />
      </div>

      {/* Ticket Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient strip */}
            <div className="h-2 bg-gradient-to-r from-brand via-purple-500 to-pink-500" />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">GateOn · E-Ticket</p>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{selected.eventTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selected.location}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* QR placeholder */}
              <div className="flex justify-center my-5">
                <div className="w-36 h-36 bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-1">
                  <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zm8-2h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM3 13h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zm8 0h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2z" /></svg>
                  <p className="text-white/40 text-[10px] font-mono">{String(selected.bookingId).slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-200 pt-4 mb-4">
                {[
                  { label: "Ticket Type", value: selected.ticketType },
                  { label: "Quantity", value: selected.quantity || 1 },
                  { label: "Booking ID", value: String(selected.bookingId).slice(0, 12), mono: true },
                  { label: "Amount Paid", value: `₹${(selected.total || 0).toLocaleString()}` },
                  { label: "Status", value: selected.status },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className={`text-sm font-bold text-slate-900 mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download
                </button>
                <button
                  onClick={() => handleShareWhatsApp(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirm(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Cancel Booking?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to cancel your ticket for <span className="font-bold text-slate-700">{cancelConfirm.eventTitle}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={async () => {
                  await cancelBooking(cancelConfirm.bookingId);
                  setCancelConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendeeDashboard;
