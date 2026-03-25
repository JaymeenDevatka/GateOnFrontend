import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../components/common/Button.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";

import { useAuth } from "../context/AuthContext.jsx";
import { createPaymentOrder, verifyPaymentAndBook, freeBookingApi } from "../services/api.js";

// ── Icons ────────────────────────────────────────────────────────────────────
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
const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// ── Razorpay SDK loader ───────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Main Component ────────────────────────────────────────────────────────────
function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getEventById } = useEventContext();
  const { findPromo, addBookingToState } = useBookingContext();
  const { user, isAuthenticated } = useAuth();

  const eventId = location.state?.eventId;
  const ticketId = location.state?.ticketId;
  const quantity = location.state?.quantity ?? 1;
  const event = getEventById(eventId);

  const ticket =
    event?.tickets?.find((t) => String(t.id) === String(ticketId)) ||
    event?.tickets?.[0] ||
    null;

  // ── State ──────────────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [attendee, setAttendee] = useState({
    firstName: "", lastName: "", email: "", phone: "",
  });

  const [team, setTeam] = useState({ name: "", size: 1 });
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "", phone: "" }]);

  const isTeamEvent = event?.participationType === "team";
  const maxTeamSize = event?.maxTeamSize ?? 1;

  // Sync team members array length with team.size
  useEffect(() => {
    if (!isTeamEvent) return;
    setTeamMembers((prev) => {
      const newSize = Math.max(1, Math.min(maxTeamSize, team.size));
      if (prev.length === newSize) return prev;
      if (prev.length < newSize)
        return [...prev, ...Array.from({ length: newSize - prev.length }, () => ({ name: "", email: "", phone: "" }))];
      return prev.slice(0, newSize);
    });
  }, [team.size, maxTeamSize, isTeamEvent]);

  const [delivery, setDelivery] = useState({ email: true, whatsapp: false });

  // ── Pricing ────────────────────────────────────────────────────────────────
  const unitPrice = Number(ticket?.price) || 0;
  const baseTotal = unitPrice * Number(quantity || 1);
  const promo = appliedPromo ? findPromo(appliedPromo.code) : null;
  const promoDiscount = promo
    ? promo.type === "PERCENT"
      ? Math.round((baseTotal * promo.value) / 100)
      : Math.min(baseTotal, Math.round(promo.value))
    : 0;
  const groupSets = Number(quantity || 1) >= 6 ? Math.floor(Number(quantity || 1) / 6) : 0;
  const groupDiscount = groupSets > 0 ? unitPrice * groupSets : 0;
  const discount = Math.min(baseTotal, promoDiscount + groupDiscount);
  const total = baseTotal - discount;
  const isFree = total === 0;

  // ── Promo ──────────────────────────────────────────────────────────────────
  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError("");
    if (!code) return;
    const found = findPromo(code);
    if (!found) { setPromoError("Promo code not found."); setAppliedPromo(null); return; }
    setAppliedPromo({ code: found.code });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!attendee.firstName || !attendee.lastName)
      return "Please enter your first and last name";
    if (!attendee.email || !attendee.email.includes("@"))
      return "Please enter a valid email address";
    if (isTeamEvent) {
      if (!team.name.trim()) return "Please enter your team name";
      if (team.size < 1 || team.size > maxTeamSize)
        return `Team size must be between 1 and ${maxTeamSize}`;
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].name.trim()) return `Name required for member ${i + 1}`;
        if (!teamMembers[i].email.includes("@")) return `Valid email required for member ${i + 1}`;
      }
    }
    if (!isAuthenticated() || !user?.id)
      return "You must be logged in to place an order";
    return null;
  };

  // ── Shared booking payload builder ─────────────────────────────────────────
  const buildBookingPayload = () => {
    // Auto-fill team leader as member 0
    const finalTeamMembers = isTeamEvent
      ? teamMembers.map((m, i) =>
        i === 0
          ? { name: `${attendee.firstName} ${attendee.lastName}`.trim(), email: attendee.email, phone: attendee.phone }
          : m
      )
      : undefined;

    return {
      eventId,
      ticketId,
      quantity,
      userId: user?.id,
      attendee: {
        name: `${attendee.firstName} ${attendee.lastName}`.trim(),
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone,
      },
      promoCode: appliedPromo?.code || null,
      delivery: delivery.whatsapp ? "whatsapp" : "email",
      ...(isTeamEvent && {
        teamName: team.name.trim(),
        teamSize: team.size,
        teamMembers: finalTeamMembers,
      }),
    };
  };

  // ── Main handler ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e?.preventDefault();

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      // ── FREE event path ────────────────────────────────────────────────────
      if (isFree) {
        const result = await freeBookingApi(buildBookingPayload());
        if (addBookingToState) addBookingToState(result);
        setBooking(result);
        setLoading(false);
        return;
      }

      // ── PAID event path ────────────────────────────────────────────────────
      // Step 1: Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError("Failed to load payment gateway. Please check your internet connection and try again.");
        setLoading(false);
        return;
      }

      // Step 2: Create Razorpay order on our backend
      const orderData = await createPaymentOrder({
        eventId,
        ticketId,
        quantity,
        promoCode: appliedPromo?.code || null,
      });

      // Backend says it's actually free after discounts
      if (orderData.free) {
        const result = await freeBookingApi(buildBookingPayload());
        if (addBookingToState) addBookingToState(result);
        setBooking(result);
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,           // paise
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "GateOn",
        description: event?.title || "Event Ticket",
        image: "/logo.png",
        prefill: {
          name: `${attendee.firstName} ${attendee.lastName}`.trim(),
          email: attendee.email,
          contact: attendee.phone || "",
        },
        theme: { color: "#f97316" },        // matches brand orange
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. You can try again.");
            setLoading(false);
          },
        },
        handler: async function (response) {
          // Step 4: Verify payment + create booking
          try {
            const result = await verifyPaymentAndBook({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentDbId: orderData.paymentDbId,
              ...buildBookingPayload(),
            });
            if (addBookingToState) addBookingToState(result);
            setBooking(result);
          } catch (verifyErr) {
            setError(verifyErr?.message || "Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      new window.Razorpay(options).open();
      // Note: setLoading(false) is called inside handler / ondismiss
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // ── Guard: not logged in ───────────────────────────────────────────────────
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

  if (!event || !ticket) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">No checkout session found.</p>
        <Button onClick={() => navigate("/events")} className="mt-4">Browse Events</Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans pt-12 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-slate-500 mt-2">
            {isFree ? "Complete your registration for free." : "Secure payment powered by Razorpay."}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Mobile event summary */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-lg">{event.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{event.date} · {event.location}</p>
              <div className="mt-3 flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                <span className="text-slate-600">{quantity} × {ticket.name || "Ticket"}</span>
                <span className="font-bold text-slate-900">{isFree ? "Free" : `₹${total.toLocaleString()}`}</span>
              </div>
            </div>

            {/* Step 1 – Contact */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">1</span>
                {isTeamEvent ? "Team Leader Contact" : "Contact Information"}
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <input
                      placeholder="John"
                      value={attendee.firstName}
                      onChange={(e) => setAttendee((p) => ({ ...p, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input
                      placeholder="Doe"
                      value={attendee.lastName}
                      onChange={(e) => setAttendee((p) => ({ ...p, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={attendee.email}
                      onChange={(e) => setAttendee((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Phone (WhatsApp)</label>
                    <input
                      placeholder="+91 98765 43210"
                      value={attendee.phone}
                      onChange={(e) => setAttendee((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Team section */}
                {isTeamEvent && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">👥</span>
                      <h3 className="text-base font-bold text-slate-800">Team Details</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/20">
                        Max {maxTeamSize} members
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Team Name <span className="text-rose-500">*</span></label>
                        <input
                          placeholder="e.g. Alpha Squad"
                          value={team.name}
                          onChange={(e) => setTeam((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Team Size <span className="text-slate-400 font-normal">(1–{maxTeamSize})</span>
                        </label>
                        <input
                          type="number" min="1" max={maxTeamSize}
                          value={team.size}
                          onChange={(e) => setTeam((p) => ({ ...p, size: Math.min(maxTeamSize, Math.max(1, Number(e.target.value))) }))}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        />
                      </div>
                      {teamMembers.length > 1 && (
                        <div className="sm:col-span-2 space-y-4 mt-2">
                          <label className="text-sm font-semibold text-slate-700 block border-b border-slate-100 pb-2">Other Member Details</label>
                          {teamMembers.slice(1).map((member, idx) => {
                            const index = idx + 1;
                            return (
                              <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Member {index + 1}</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700">Name <span className="text-rose-500">*</span></label>
                                    <input
                                      placeholder="Full Name"
                                      value={member.name}
                                      onChange={(e) => {
                                        const n = [...teamMembers]; n[index].name = e.target.value; setTeamMembers(n);
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Email <span className="text-rose-500">*</span></label>
                                    <input
                                      type="email" placeholder="Email"
                                      value={member.email}
                                      onChange={(e) => {
                                        const n = [...teamMembers]; n[index].email = e.target.value; setTeamMembers(n);
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                      placeholder="Phone"
                                      value={member.phone}
                                      onChange={(e) => {
                                        const n = [...teamMembers]; n[index].phone = e.target.value; setTeamMembers(n);
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 – Delivery */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">2</span>
                Delivery Method
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  {[
                    { key: "email", label: "Email Ticket" },
                    { key: "whatsapp", label: "WhatsApp Ticket" },
                  ].map(({ key, label }) => (
                    <label key={key} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer select-none ${delivery[key] ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${delivery[key] ? "border-brand" : "border-slate-300"}`}>
                        {delivery[key] && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                      </div>
                      <span className={`font-semibold text-sm ${delivery[key] ? "text-slate-900" : "text-slate-600"}`}>{label}</span>
                      <input type="checkbox" className="hidden" checked={delivery[key]}
                        onChange={(e) => setDelivery((p) => ({ ...p, [key]: e.target.checked }))} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 – Payment (only shown for paid events) */}
            {!isFree && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">3</span>
                  Payment
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
                  {/* Razorpay badge */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <img
                      src="https://razorpay.com/favicon.png"
                      alt="Razorpay"
                      className="w-6 h-6 rounded"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Powered by Razorpay</p>
                      <p className="text-xs text-slate-500">UPI · Cards · Net Banking · Wallets · EMI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <ShieldIcon />
                    <p>Your payment is processed securely by Razorpay. GateOn never stores your card details.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Event summary (desktop) */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</p>
              <h3 className="font-bold text-slate-900">{event.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{event.location}</p>
              <div className="mt-3 flex justify-between text-sm border-t border-slate-100 pt-3">
                <span className="text-slate-600">{quantity} × {ticket.name || "Ticket"}</span>
                <span className="font-semibold text-slate-900">₹{baseTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand flex-1"
              />
              <Button type="button" variant="outline" onClick={applyPromo} className="border-brand text-brand hover:bg-brand/10">
                Apply
              </Button>
              {appliedPromo && !promoError && (
                <span className="text-xs text-emerald-700 w-full">✓ {appliedPromo.code} applied</span>
              )}
              {promoError && <span className="text-xs text-rose-700 w-full">{promoError}</span>}
            </div>

            {/* Totals */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{baseTotal.toLocaleString()}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo discount</span>
                  <span>−₹{promoDiscount.toLocaleString()}</span>
                </div>
              )}
              {groupDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Group offer</span>
                  <span>−₹{groupDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 text-base">
                <span>Total</span>
                <span>{isFree ? "Free" : `₹${total.toLocaleString()}`}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* CTA / Success */}
            {!booking ? (
              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20 py-3 text-base font-semibold"
              >
                {loading
                  ? "Processing…"
                  : isFree
                    ? "Register for Free"
                    : `Pay ₹${total.toLocaleString()} via Razorpay`}
              </Button>
            ) : (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Booking Confirmed!
                </div>
                <p className="text-sm text-emerald-700">
                  Booking ID: <span className="font-mono font-bold">{booking.id}</span>
                </p>
                <div className="bg-white/60 p-3 rounded-lg border border-emerald-100 flex items-start gap-2">
                  <MailIcon />
                  <p className="text-xs text-emerald-800">
                    Your ticket and QR code have been sent to{" "}
                    <strong>{booking.attendee?.email || attendee.email}</strong>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => navigate("/attendee")}
                >
                  View My Ticket
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
