import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/common/Button.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getEventById } = useEventContext();
  const { findPromo, createBooking } = useBookingContext();
  const eventId = location.state?.eventId;
  const ticketId = location.state?.ticketId;
  const quantity = location.state?.quantity ?? 1;
  const event = eventId ? getEventById(eventId) : null;
  const ticket =
    event?.tickets?.find((t) => String(t.id) === String(ticketId)) ||
    event?.tickets?.[0] ||
    null;
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [booking, setBooking] = useState(null);

  const [attendee, setAttendee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [delivery, setDelivery] = useState({ email: true, whatsapp: false });
  const [paymentMethod, setPaymentMethod] = useState("upi");

  if (!event || !ticket) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">No checkout session found.</p>
      </div>
    );
  }

  const unitPrice = Number(ticket.price) || 0;
  const baseTotal = unitPrice * Number(quantity || 1);
  const promo = appliedPromo ? findPromo(appliedPromo.code) : null;
  const promoDiscount = promo
    ? promo.type === "PERCENT"
      ? Math.round((baseTotal * promo.value) / 100)
      : Math.min(baseTotal, Math.round(promo.value))
    : 0;
  const groupSets =
    Number(quantity || 1) >= 6 ? Math.floor(Number(quantity || 1) / 6) : 0;
  const groupDiscount = groupSets > 0 ? unitPrice * groupSets : 0;
  const discount = Math.min(baseTotal, promoDiscount + groupDiscount);
  const total = baseTotal - discount;

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError("");
    if (!code) return;
    const found = findPromo(code);
    if (!found) {
      setPromoError("Promo code not found.");
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo({ code: found.code });
  };

  const handlePlaceOrder = async () => {
    const result = await createBooking({
      event,
      ticket: { id: ticket.id, price: unitPrice },
      quantity,
      attendee,
      promoCode: appliedPromo?.code || null,
      delivery,
    });

    if (result.ok) setBooking(result.booking);
  };

  return (
    <div className="container-page max-w-3xl">
      <div className="space-y-1 mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500">
          This mimics Eventbrite’s checkout – but doesn’t connect to real
          payments yet.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          <p className="text-xs text-slate-500">
            {event.date} · {event.location}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Ticket: {ticket.label || ticket.name || "Ticket"} · Quantity:{" "}
            {quantity} ticket(s)
          </p>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-700">
            Contact information
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="First name"
              value={attendee.firstName}
              onChange={(e) =>
                setAttendee((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              placeholder="Last name"
              value={attendee.lastName}
              onChange={(e) =>
                setAttendee((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              placeholder="Email address"
              value={attendee.email}
              onChange={(e) =>
                setAttendee((prev) => ({ ...prev, email: e.target.value }))
              }
              className="sm:col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              placeholder="Phone (WhatsApp)"
              value={attendee.phone}
              onChange={(e) =>
                setAttendee((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="sm:col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Delivery</p>
          <p className="text-xs text-slate-500 mt-1">
            Tickets are stored in My Tickets. In production this will also send
            Email/WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={delivery.email}
                onChange={(e) =>
                  setDelivery((prev) => ({ ...prev, email: e.target.checked }))
                }
              />
              <span>Email</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={delivery.whatsapp}
                onChange={(e) =>
                  setDelivery((prev) => ({
                    ...prev,
                    whatsapp: e.target.checked,
                  }))
                }
              />
              <span>WhatsApp</span>
            </label>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Payment</p>
          <p className="text-xs text-slate-500 mt-1">
            Frontend-only payment selection. Integrate a gateway
            (UPI/cards/netbanking) later.
          </p>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Net banking</option>
            <option value="wallet">Wallet</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Selected: {paymentMethod.toUpperCase()}
          </p>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Discounts & promotions
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Apply promo codes, early bird or group offers – simulated in
                frontend.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <Button type="button" variant="outline" onClick={applyPromo}>
              Apply
            </Button>
            {appliedPromo && !promoError && (
              <span className="text-xs text-emerald-700">
                Applied {appliedPromo.code}.
              </span>
            )}
            {promoError && (
              <span className="text-xs text-rose-700">{promoError}</span>
            )}
          </div>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Order total
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This is a demo – no real charges or payment gateway yet.
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Subtotal: ₹{baseTotal.toLocaleString()}</p>
              {promoDiscount > 0 && (
                <p>Promo: -₹{promoDiscount.toLocaleString()}</p>
              )}
              {groupDiscount > 0 && (
                <p>Group offer: -₹{groupDiscount.toLocaleString()}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Total: {total === 0 ? "Free" : `₹${total.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {!booking ? (
          <div className="flex justify-end">
            <Button onClick={handlePlaceOrder}>Place order</Button>
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl border border-emerald-200/80 shadow-card p-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-800">
              Booking confirmed
            </p>
            <p className="text-xs text-emerald-700">
              Your booking ID is <span className="font-mono">{booking.id}</span>
              . Your ticket is available under My Tickets.
            </p>
            <p className="text-xs text-slate-500">
              In a real system, this step would also trigger Email/WhatsApp
              confirmations and reminders.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/attendee")}
              >
                Go to My Tickets
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
