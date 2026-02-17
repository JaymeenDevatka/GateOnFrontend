import OrganizerStats from "../components/dashboard/OrganizerStats.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useMemo, useState } from "react";

function downloadTextFile({
  filename,
  content,
  mime = "text/plain;charset=utf-8",
}) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function OrganizerDashboard() {
  const { events } = useEventContext();
  const { user } = useAuth();
  const { bookings, addPromoCode, removePromoCode, promoCodes } =
    useBookingContext();
  const [exportEventId, setExportEventId] = useState("");
  const [promoForm, setPromoForm] = useState({
    code: "",
    type: "PERCENT",
    value: 20,
  });
  const [promoError, setPromoError] = useState("");

  const myEvents = useMemo(() => {
    if (!user) return [];
    return events.filter((e) => (e.ownerId ? e.ownerId === user.id : true));
  }, [events, user]);

  const myEventIds = useMemo(
    () => new Set(myEvents.map((e) => String(e.id))),
    [myEvents],
  );
  const myBookings = useMemo(
    () => bookings.filter((b) => myEventIds.has(String(b.eventId))),
    [bookings, myEventIds],
  );
  const confirmed = useMemo(
    () => myBookings.filter((b) => b.status === "confirmed"),
    [myBookings],
  );
  const checkedInCount = useMemo(
    () => confirmed.filter((b) => Boolean(b.checkedInAt)).length,
    [confirmed],
  );
  const ticketsSold = useMemo(
    () => confirmed.reduce((sum, b) => sum + (b.quantity || 0), 0),
    [confirmed],
  );
  const revenue = useMemo(
    () => confirmed.reduce((sum, b) => sum + (b.pricing?.total || 0), 0),
    [confirmed],
  );

  const stats = {
    liveEvents: myEvents.length,
    ticketsSold,
    revenue,
    views: 3200,
  };

  const handleExport = (format) => {
    const id = exportEventId || (myEvents[0]?.id ?? "");
    if (!id) return;
    const event = myEvents.find((e) => String(e.id) === String(id));
    if (!event) return;
    const eventBookings = myBookings.filter(
      (b) => String(b.eventId) === String(id),
    );

    const rows = eventBookings.map((b) => {
      const ticket = event.tickets?.find(
        (t) => String(t.id) === String(b.ticketId),
      );
      const attendeeName =
        `${b.attendee?.firstName || ""} ${b.attendee?.lastName || ""}`.trim();
      return {
        bookingId: b.id,
        status: b.status,
        attendeeName,
        email: b.attendee?.email || "",
        phone: b.attendee?.phone || "",
        ticketType: ticket?.label || ticket?.name || "Ticket",
        quantity: b.quantity || 0,
        total: b.pricing?.total || 0,
        promoCode: b.pricing?.promoCode || "",
        checkedInAt: b.checkedInAt || "",
        createdAt: b.createdAt || "",
      };
    });

    const header = Object.keys(
      rows[0] || {
        bookingId: "",
        status: "",
        attendeeName: "",
        email: "",
        phone: "",
        ticketType: "",
        quantity: "",
        total: "",
        promoCode: "",
        checkedInAt: "",
        createdAt: "",
      },
    );

    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header
          .map((k) => {
            const value = String(r[k] ?? "");
            const escaped = value.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const safeName =
      String(event.title || "event")
        .replace(/[^a-z0-9\-_ ]/gi, "")
        .trim() || "event";
    const ext = format === "excel" ? "xls" : "csv";
    downloadTextFile({
      filename: `attendees_${safeName}_${id}.${ext}`,
      content: csv,
      mime: "text/csv;charset=utf-8",
    });
  };

  const handleAddPromo = async () => {
    setPromoError("");
    const value = Number(promoForm.value);
    const res = await addPromoCode({
      code: promoForm.code,
      type: promoForm.type,
      value,
    });
    if (!res.ok) {
      setPromoError(res.error || "Unable to add promo code.");
      return;
    }
    setPromoForm((prev) => ({ ...prev, code: "" }));
  };

  return (
    <div className="container-page space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Organizer dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of your events, notifications and exports. You can host and
            attend events with a single account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Logged in as</p>
              <p className="text-xs font-semibold text-slate-900">
                {user.name || user.email}
              </p>
            </div>
          )}
          <Button as="button">
            <Link to="/create-event">+ New event</Link>
          </Button>
        </div>
      </div>
      onClick=
      {async () => {
        await removePromoCode(p.code);
      }}
      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Check-in stats
          </h2>
          <span className="text-xs text-slate-600">
            {checkedInCount} / {confirmed.length} checked in
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Volunteers validate tickets using the Check-in screen. Duplicate
          entries are blocked.
        </p>
      </section>
      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Notifications & reminders
          </h2>
          <div className="flex gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              Email + WhatsApp
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              24h & 1h before
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Toggle which channels EventHive should use once integrated: currently
          a frontend-only control.
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>Email confirmations</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>WhatsApp confirmations</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>24h reminder</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>1h reminder</span>
          </label>
        </div>
      </section>
      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Attendee exports
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Export attendee list for CSV/Excel workflows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs"
              type="button"
              onClick={() => handleExport("csv")}
            >
              CSV
            </button>
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs"
              type="button"
              onClick={() => handleExport("excel")}
            >
              Excel
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={exportEventId}
            onChange={(e) => setExportEventId(e.target.value)}
            className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-white min-w-[220px]"
          >
            <option value="">Select event</option>
            {myEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Exports include booking ID, attendee info, ticket type, totals, and
            check-in.
          </p>
        </div>
      </section>
      <section className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Promo codes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create discount codes usable at checkout.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={promoForm.code}
            onChange={(e) =>
              setPromoForm((prev) => ({ ...prev, code: e.target.value }))
            }
            placeholder="CODE (e.g. HACKATHON25)"
            className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-white"
          />
          <select
            value={promoForm.type}
            onChange={(e) =>
              setPromoForm((prev) => ({ ...prev, type: e.target.value }))
            }
            className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-white"
          >
            <option value="PERCENT">Percent</option>
            <option value="AMOUNT">Amount (₹)</option>
          </select>
          <input
            type="number"
            min="0"
            value={promoForm.value}
            onChange={(e) =>
              setPromoForm((prev) => ({
                ...prev,
                value: Number(e.target.value),
              }))
            }
            className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-white w-28"
          />
          <Button
            variant="outline"
            className="text-xs px-4 py-2"
            type="button"
            onClick={handleAddPromo}
          >
            Add
          </Button>
          {promoError && (
            <span className="text-xs text-rose-700">{promoError}</span>
          )}
        </div>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden">
          {promoCodes.slice(0, 12).map((p) => (
            <div
              key={p.code}
              className="flex items-center justify-between px-4 py-3 bg-white"
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">{p.code}</p>
                <p className="text-[11px] text-slate-500">
                  {p.type === "PERCENT" ? `${p.value}% off` : `₹${p.value} off`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removePromoCode(p.code)}
                className="text-[11px] font-semibold text-slate-600 hover:text-rose-600"
              >
                Remove
              </button>
            </div>
          ))}
          {!promoCodes.length && (
            <p className="px-4 py-4 text-sm text-slate-500">
              No promo codes yet.
            </p>
          )}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Your events</h2>
        <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card divide-y divide-slate-100">
          {myEvents.map((e) => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {e.title}
                </p>
                <p className="text-xs text-slate-500">
                  {e.date} · {e.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {e.attendees}+ attendees
                </p>
                <p className="text-[11px] text-slate-400">
                  Click to view event page
                </p>
              </div>
            </Link>
          ))}
          {!myEvents.length && (
            <p className="px-4 py-4 text-sm text-slate-500">
              You have no events yet. Create one to see it here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default OrganizerDashboard;
