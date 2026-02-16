import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/common/Button.jsx';
import { useEventContext } from '../context/EventContext.jsx';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getEventById } = useEventContext();
  const eventId = location.state?.eventId;
  const quantity = location.state?.quantity ?? 1;
  const event = eventId ? getEventById(eventId) : null;
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  if (!event) {
    return (
      <div className="container-page py-10">
        <p className="text-sm text-slate-500">No checkout session found.</p>
      </div>
    );
  }

  const baseTotal = (event.price || 0) * quantity;
  const discount = appliedPromo ? Math.round(baseTotal * 0.2) : 0;
  const total = baseTotal - discount;

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    setAppliedPromo({ code: promoCode.trim().toUpperCase(), type: 'EARLY_BIRD_20' });
  };

  const handlePlaceOrder = () => {
    const id = `EVH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    setBookingId(id);
  };

  return (
    <div className="container-page max-w-3xl">
      <div className="space-y-1 mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500">
          This mimics Eventbrite’s checkout – but doesn’t connect to real payments yet.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          <p className="text-xs text-slate-500">
            {event.date} · {event.location}
          </p>
          <p className="text-xs text-slate-500 mt-1">Quantity: {quantity} ticket(s)</p>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-700">Contact information</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="First name"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              placeholder="Last name"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              placeholder="Email address"
              className="sm:col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Discounts & promotions</p>
              <p className="text-xs text-slate-500 mt-1">
                Apply promo codes, early bird or group offers – simulated in frontend.
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
            {appliedPromo && (
              <span className="text-xs text-emerald-700">
                Applied {appliedPromo.code} – 20% off (demo).
              </span>
            )}
          </div>
        </div>

        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Order total</p>
              <p className="text-xs text-slate-500 mt-1">
                This is a demo – no real charges or payment gateway yet.
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Subtotal: ₹{baseTotal.toLocaleString()}</p>
              {discount > 0 && <p>Discount: -₹{discount.toLocaleString()}</p>}
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Total: {total === 0 ? 'Free' : `₹${total.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {!bookingId ? (
          <div className="flex justify-end">
            <Button onClick={handlePlaceOrder}>Place order</Button>
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl border border-emerald-200/80 shadow-card p-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-800">Booking confirmed</p>
            <p className="text-xs text-emerald-700">
              Your booking ID is <span className="font-mono">{bookingId}</span>. A mock ticket is
              available under My Tickets.
            </p>
            <p className="text-xs text-slate-500">
              In a real system, this step would also trigger Email/WhatsApp confirmations and
              reminders.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate('/attendee')}
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

