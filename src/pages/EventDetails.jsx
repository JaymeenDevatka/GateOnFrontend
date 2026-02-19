import { useParams, useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext.jsx";
import TicketSelector from "../components/ticket/TicketSelector.jsx";
import QRPreview from "../components/ticket/QRPreview.jsx";
import Button from "../components/common/Button.jsx";
import { useState } from "react";
import { useBookingContext } from "../context/BookingContext.jsx";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById } = useEventContext();
  const { getTicketSoldCount } = useBookingContext();
  const event = getEventById(id);
  const initialTicketId = event?.tickets?.[0]?.id || "general";
  const [selectedTicket, setSelectedTicket] = useState(initialTicketId);
  const [quantity, setQuantity] = useState(1);
  const maxPerUser = 5;

  if (!event) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">Event not found.</p>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        eventId: event.id,
        ticketId: selectedTicket,
        quantity,
      },
    });
  };

  const ticketsForSelector = (event.tickets || []).map((t) => {
    const maxQty = Number(t.capacity ?? t.maxQuantity) || 0;
    const sold = getTicketSoldCount(event.id, t.id);
    const remaining = Math.max(0, maxQty - sold);
    return {
      id: t.id,
      name: t.label || t.name || "Ticket",
      description: t.description || "Ticket access for this event.",
      price: Number(t.price) || 0,
      remaining: maxQty ? remaining : 0,
    };
  });

  const selectedTicketObj =
    ticketsForSelector.find((t) => t.id === selectedTicket) ||
    ticketsForSelector[0];

  return (
    <div className="container-page grid lg:grid-cols-[2fr,1.4fr] gap-10">
      <section className="space-y-5">
        <div className="rounded-2xl h-64 relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-medium text-brand">{event.date?.split('T')[0]}</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {event.title}
          </h1>
          <p className="text-sm text-slate-600">{event.location}</p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {event.description || "No description provided."}
          </p>

          {event.liveLink && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <span className="font-semibold">Live streaming enabled</span>
              <a
                href={event.liveLink}
                target="_blank"
                rel="noreferrer"
                className="underline font-medium"
              >
                Join stream
              </a>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Date and Time</h3>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="p-2 bg-brand/10 rounded-lg text-brand">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium">{event.date?.split('T')[0]}</p>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-medium">{event.location}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Tickets</p>
            <p className="text-xs text-slate-500">
              {Math.max(0, Number(event.attendees ?? 0))}+ already going
            </p>
          </div>
          <TicketSelector
            tickets={ticketsForSelector}
            selectedId={selectedTicket}
            onSelect={setSelectedTicket}
          />
          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Quantity</span>
              <input
                type="number"
                min={1}
                max={maxPerUser}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      maxPerUser,
                      Math.max(1, Number(e.target.value) || 1),
                    ),
                  )
                }
                className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <p className="text-slate-500">
              Max {maxPerUser} tickets per attendee.
            </p>
          </div>
          <Button
            className="w-full mt-1"
            onClick={handleCheckout}
            disabled={!selectedTicketObj || selectedTicketObj.remaining === 0}
          >
            Checkout
          </Button>
        </div>
        <QRPreview eventTitle={event.title} />
      </aside>
    </div>
  );
}

export default EventDetails;
