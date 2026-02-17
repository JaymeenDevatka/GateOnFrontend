import AttendeeTickets from "../components/dashboard/AttendeeTickets.jsx";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useMemo, useState } from "react";

function openPrintableTicket({ event, booking, ticketLabel }) {
  const safe = (v) =>
    String(v ?? "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>EventHive Ticket</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; max-width: 680px; }
          .muted { color: #64748b; font-size: 12px; }
          .title { font-size: 20px; font-weight: 700; margin: 0; }
          .row { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; }
          .qr { width: 160px; height: 160px; border-radius: 12px; background: #0f172a; color: rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; font-size: 12px; }
          .kv { margin-top: 8px; font-size: 13px; }
          .kv b { display: inline-block; width: 140px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="card">
          <p class="muted">EventHive / GateOn</p>
          <h1 class="title">${safe(event.title)}</h1>
          <p class="muted">${safe(event.date)} · ${safe(event.location)}</p>
          <div class="row">
            <div>
              <div class="kv"><b>Booking ID</b> ${safe(booking.id)}</div>
              <div class="kv"><b>Ticket</b> ${safe(ticketLabel)}</div>
              <div class="kv"><b>Quantity</b> ${safe(booking.quantity)}</div>
              <div class="kv"><b>Attendee</b> ${safe(booking.attendee?.firstName)} ${safe(booking.attendee?.lastName)}</div>
              <div class="kv"><b>Email</b> ${safe(booking.attendee?.email)}</div>
            </div>
            <div class="qr">QR: ${safe(booking.id)}</div>
          </div>
          <p class="muted" style="margin-top: 14px;">Show this at entry. Check-in prevents duplicate use.</p>
          <button onclick="window.print()" style="margin-top: 12px; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-weight: 600;">Print / Save as PDF</button>
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

  const myBookings = useMemo(
    () => (user ? getBookingsByUser(user.id) : []),
    [getBookingsByUser, user],
  );

  const tickets = useMemo(() => {
    return myBookings.map((b) => {
      const event = getEventById(b.eventId);
      const ticket = event?.tickets?.find(
        (t) => String(t.id) === String(b.ticketId),
      );
      return {
        id: b.id,
        bookingId: b.id,
        eventId: b.eventId,
        eventTitle: event?.title || "Event",
        date: event?.date || "",
        location: event?.location || "",
        ticketType: ticket?.label || ticket?.name || "Ticket",
        orderNumber: b.id,
        status: b.status,
        raw: { booking: b, event, ticket },
      };
    });
  }, [getEventById, myBookings]);

  const handleDownload = (t) => {
    const event = t.raw?.event;
    const booking = t.raw?.booking;
    const ticketLabel = t.ticketType;
    if (!event || !booking) return;
    openPrintableTicket({ event, booking, ticketLabel });
  };

  const handleShareWhatsApp = (t) => {
    const event = t.raw?.event;
    if (!event) return;
    const text = `My EventHive ticket for ${event.title}\nBooking ID: ${t.bookingId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="container-page space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My tickets</h1>
          <p className="text-sm text-slate-500">
            View upcoming events you are attending – similar to Eventbrite’s
            tickets page.
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold text-slate-900">Loyalty points: 120</p>
          <p className="text-slate-500">
            Earn rewards for repeat participation.
          </p>
        </div>
      </div>

      <AttendeeTickets
        tickets={tickets}
        onViewTicket={(t) => setSelected(t)}
        onDownloadTicket={handleDownload}
        onCancelBooking={async (t) => {
          await cancelBooking(t.bookingId);
        }}
      />

      <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-2 text-xs text-slate-600">
        <p className="font-semibold text-slate-900 text-sm">
          Refund & cancellation policy
        </p>
        <p>
          This is a frontend-only representation of your refund workflow. In
          production, rules like “Refunds allowed up to 24 hours before event”
          would be enforced by the backend and payment gateway.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" className="text-xs px-3 py-1.5">
            Request cancellation
          </Button>
          <Button variant="outline" className="text-xs px-3 py-1.5">
            View refund status
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title="Ticket"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {selected.eventTitle}
              </p>
              <p className="text-xs text-slate-500">
                {selected.date} · {selected.location}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Booking:</span>{" "}
                  {selected.bookingId}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Type:</span>{" "}
                  {selected.ticketType}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Status:</span>{" "}
                  {selected.status}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                  onClick={() => handleDownload(selected)}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                  onClick={() => handleShareWhatsApp(selected)}
                >
                  WhatsApp
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              For entry, use your booking ID in the Check-in screen (QR scanning
              integrates later).
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AttendeeDashboard;
