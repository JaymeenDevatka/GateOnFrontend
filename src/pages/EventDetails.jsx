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
          <p className="text-xs font-medium text-brand">{event.date}</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {event.title}
          </h1>
          <p className="text-sm text-slate-600">{event.location}</p>
          <p className="text-xs text-slate-500">
            This is a static description in the frontend. In a real app,
            description, schedule, and organizer details would all come from
            your backend just like on Eventbrite.
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

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span>Share:</span>
            <button className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200">
              WhatsApp
            </button>
            <button className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200">
              Instagram
            </button>
            <button className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200">
              Twitter
            </button>
            <button className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200">
              Facebook
            </button>
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
