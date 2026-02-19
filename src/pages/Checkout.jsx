import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/common/Button.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
// Icons
const TicketIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);


function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getEventById } = useEventContext();
  const { findPromo, createBooking } = useBookingContext();
  const { user, isAuthenticated } = useAuth();
  const eventId = location.state?.eventId;
  const ticketId = location.state?.ticketId;
  const quantity = location.state?.quantity ?? 1;
  const event = getEventById(eventId);

  const ticket =
    event?.tickets?.find((t) => String(t.id) === String(ticketId)) ||
    event?.tickets?.[0] ||
    null;

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [attendee, setAttendee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [delivery, setDelivery] = useState({ email: true, whatsapp: false });
  const [paymentMethod, setPaymentMethod] = useState("upi");

  if (!isAuthenticated()) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">Please log in to complete checkout.</p>
        <Button onClick={() => navigate("/login", { state: { from: location } })} className="mt-4">
          Log In
        </Button>
      </div>
    );
  }

  // Debug: Log user state
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Checkout - User state:', { user, isAuthenticated: isAuthenticated() });
  }

  if (!event || !ticket) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">No checkout session found.</p>
        <Button onClick={() => navigate("/events")} className="mt-4">
          Browse Events
        </Button>
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

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!attendee.firstName || !attendee.lastName) {
      setError("Please enter your first and last name");
      return;
    }
    if (!attendee.email || !attendee.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isAuthenticated() || !user || !user.id) {
      setError("You must be logged in to place an order. Please log in and try again.");
      console.error("User not authenticated:", { user, isAuthenticated: isAuthenticated() });
      setTimeout(() => {
        navigate("/login", { state: { from: location } });
      }, 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Creating booking with user:", user);
      const result = await createBooking({
        event,
        ticket: { id: ticket.id, price: unitPrice },
        quantity,
        attendee,
        promoCode: appliedPromo?.code || null,
        delivery,
      });

      if (result.ok) {
        setBooking(result.booking);
      } else {
        setError(result.error || "Failed to create booking. Please try again.");
        console.error("Booking error:", result.error);
      }
    } catch (err) {
      const errorMsg = err?.message || err?.data?.message || "An error occurred. Please try again.";
      setError(errorMsg);
      console.error("Booking exception:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans pt-12 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-slate-500 mt-2">
            Complete your purchase securely. This mimics a real checkout process.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-8 space-y-8">

            {/* Event Summary Mobile (Visible only on small screens) */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-lg">{event.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{event.date} · {event.location}</p>
              <div className="mt-3 flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                <span className="text-slate-600">{quantity} x {ticket.label || ticket.name || "Ticket"}</span>
                <span className="font-bold text-slate-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* 1. Attendee Details */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm">1</span>
                Contact Information
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <div className="relative group">
                      <input
                        placeholder="John"
                        value={attendee.firstName}
                        onChange={(e) => setAttendee((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input
                      placeholder="Doe"
                      value={attendee.lastName}
                      onChange={(e) => setAttendee((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <input
                        placeholder="you@example.com"
                        value={attendee.email}
                        onChange={(e) => setAttendee((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Phone (WhatsApp)</label>
                    <div className="relative">
                      <input
                        placeholder="+91 98765 43210"
                        value={attendee.phone}
                        onChange={(e) => setAttendee((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Options */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm">2</span>
                Delivery Method
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer select-none ${delivery.email ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${delivery.email ? 'border-brand' : 'border-slate-300'}`}>
                      {delivery.email && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                    <span className={`font-semibold text-sm ${delivery.email ? 'text-slate-900' : 'text-slate-600'}`}>Email Ticket</span>
                    <input type="checkbox" className="hidden" checked={delivery.email} onChange={(e) => setDelivery(prev => ({ ...prev, email: e.target.checked }))} />
                  </label>

                  <label className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer select-none ${delivery.whatsapp ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${delivery.whatsapp ? 'border-brand' : 'border-slate-300'}`}>
                      {delivery.whatsapp && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                    <span className={`font-semibold text-sm ${delivery.whatsapp ? 'text-slate-900' : 'text-slate-600'}`}>WhatsApp Ticket</span>
                    <input type="checkbox" className="hidden" checked={delivery.whatsapp} onChange={(e) => setDelivery(prev => ({ ...prev, whatsapp: e.target.checked }))} />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Payment */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm">3</span>
                Payment
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Select Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all cursor-pointer"
                    >
                      <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="wallet">Wallets</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex items-start gap-2">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Your payment information is encrypted and secure. We do not store your card details.
                  </div>
                </div>
              </div>
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

        </div>
      </div>
    </div>
  );
}

export default Checkout;
