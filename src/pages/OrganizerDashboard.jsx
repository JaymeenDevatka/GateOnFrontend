import { useEventContext } from "../context/EventContext.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useMemo, useState } from "react";

function downloadTextFile({ filename, content, mime = "text/plain;charset=utf-8" }) {
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

function StatCard({ icon, label, value, sub, color = "brand" }) {
  const colors = {
    brand: "from-brand/10 to-brand/5 border-brand/20 text-brand",
    green: "from-emerald-50 to-emerald-50/50 border-emerald-200 text-emerald-600",
    purple: "from-purple-50 to-purple-50/50 border-purple-200 text-purple-600",
    amber: "from-amber-50 to-amber-50/50 border-amber-200 text-amber-600",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    brand: "bg-brand/10 text-brand",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

function OrganizerDashboard() {
  const { events } = useEventContext();
  const { user } = useAuth();
  const { bookings, addPromoCode, removePromoCode, promoCodes } = useBookingContext();
  const [exportEventId, setExportEventId] = useState("");
  const [promoForm, setPromoForm] = useState({ code: "", type: "PERCENT", value: 20 });
  const [promoError, setPromoError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const myEvents = useMemo(() => {
    if (!user) return [];
    return events.filter((e) => (e.ownerId ? e.ownerId === user.id : true));
  }, [events, user]);

  const myEventIds = useMemo(() => new Set(myEvents.map((e) => String(e.id))), [myEvents]);
  const myBookings = useMemo(() => bookings.filter((b) => myEventIds.has(String(b.eventId))), [bookings, myEventIds]);
  const confirmed = useMemo(() => myBookings.filter((b) => b.status === "confirmed"), [myBookings]);
  const checkedInCount = useMemo(() => confirmed.filter((b) => Boolean(b.checkedInAt)).length, [confirmed]);
  const ticketsSold = useMemo(() => confirmed.reduce((sum, b) => sum + (b.quantity || 0), 0), [confirmed]);
  const revenue = useMemo(() => confirmed.reduce((sum, b) => sum + (b.pricing?.total || 0), 0), [confirmed]);

  const handleExport = (format) => {
    const id = exportEventId || (myEvents[0]?.id ?? "");
    if (!id) return;
    const event = myEvents.find((e) => String(e.id) === String(id));
    if (!event) return;
    const eventBookings = myBookings.filter((b) => String(b.eventId) === String(id));
    const rows = eventBookings.map((b) => {
      const ticket = event.tickets?.find((t) => String(t.id) === String(b.ticketId));
      const attendeeName = `${b.attendee?.firstName || ""} ${b.attendee?.lastName || ""}`.trim();
      return {
        bookingId: b.id, status: b.status, attendeeName,
        email: b.attendee?.email || "", phone: b.attendee?.phone || "",
        ticketType: ticket?.label || ticket?.name || "Ticket",
        quantity: b.quantity || 0, total: b.pricing?.total || 0,
        promoCode: b.pricing?.promoCode || "", checkedInAt: b.checkedInAt || "", createdAt: b.createdAt || "",
      };
    });
    const header = Object.keys(rows[0] || { bookingId: "", status: "", attendeeName: "", email: "", phone: "", ticketType: "", quantity: "", total: "", promoCode: "", checkedInAt: "", createdAt: "" });
    const csv = [header.join(","), ...rows.map((r) => header.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const safeName = String(event.title || "event").replace(/[^a-z0-9\-_ ]/gi, "").trim() || "event";
    downloadTextFile({ filename: `attendees_${safeName}_${id}.${format === "excel" ? "xls" : "csv"}`, content: csv, mime: "text/csv;charset=utf-8" });
  };

  const handleAddPromo = async () => {
    setPromoError("");
    const res = await addPromoCode({ code: promoForm.code, type: promoForm.type, value: Number(promoForm.value) });
    if (!res.ok) { setPromoError(res.error || "Unable to add promo code."); return; }
    setPromoForm((prev) => ({ ...prev, code: "" }));
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "events", label: "My Events" },
    { key: "promos", label: "Promo Codes" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 font-display">Organizer Dashboard</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Manage your events and attendees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand">{(user.name || user.email || "U")[0].toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{user.name || user.email}</span>
                </div>
              )}
              <Link
                to="/create-event"
                className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            color="brand"
            label="Live Events"
            value={myEvents.length}
            sub="Total events created"
            icon={<svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            color="green"
            label="Tickets Sold"
            value={ticketsSold}
            sub={`${confirmed.length} confirmed bookings`}
            icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
          />
          <StatCard
            color="amber"
            label="Checked In"
            value={checkedInCount}
            sub={`of ${confirmed.length} confirmed`}
            icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Events */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 font-display">Recent Events</h2>
                <button onClick={() => setActiveTab("events")} className="text-xs text-brand font-semibold hover:underline">View all →</button>
              </div>
              <div className="divide-y divide-slate-100">
                {myEvents.slice(0, 5).map((e) => {
                  const eventBookings = myBookings.filter((b) => String(b.eventId) === String(e.id));
                  const eventRevenue = eventBookings.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.pricing?.total || 0), 0);
                  return (
                    <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{e.title}</p>
                        <p className="text-xs text-slate-500 truncate">{e.location || "—"} · {e.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">₹{eventRevenue.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{eventBookings.length} bookings</p>
                      </div>
                      <Link to={`/events/${e.id}`} className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  );
                })}
                {!myEvents.length && (
                  <div className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No events yet</p>
                    <p className="text-xs text-slate-400 mt-1">Create your first event to get started</p>
                    <Link to="/create-event" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-brand hover:underline">+ Create Event</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-5">
              {/* Check-in Progress */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Check-in Progress</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-slate-900">{checkedInCount}</span>
                  <span className="text-sm text-slate-500 mb-1">/ {confirmed.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-brand rounded-full h-2.5 transition-all"
                    style={{ width: confirmed.length ? `${(checkedInCount / confirmed.length) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {confirmed.length ? Math.round((checkedInCount / confirmed.length) * 100) : 0}% attendees checked in
                </p>
              </div>

              {/* Quick Export */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Export Attendees</h3>
                <select
                  value={exportEventId}
                  onChange={(e) => setExportEventId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand mb-3"
                >
                  <option value="">Select event</option>
                  {myEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("excel")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === "events" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-display">All Events</h2>
              <Link to="/create-event" className="flex items-center gap-1.5 bg-brand text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-brand/90 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Event
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Event</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Bookings</th>
                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Revenue</th>
                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myEvents.map((e) => {
                    const eb = myBookings.filter((b) => String(b.eventId) === String(e.id));
                    const er = eb.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.pricing?.total || 0), 0);
                    return (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{e.title}</p>
                              <p className="text-xs text-slate-400">{e.date ? new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><Badge color="brand">{e.category}</Badge></td>
                        <td className="px-4 py-4 text-sm text-slate-600 max-w-[160px] truncate">{e.location || "—"}</td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{eb.length}</td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">₹{er.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <Badge color={e.status === "published" ? "green" : "amber"}>
                            {e.status === "published" ? "Live" : "Draft"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {!myEvents.length && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                        No events yet. <Link to="/create-event" className="text-brand font-bold hover:underline">Create one →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Promo Codes Tab */}
        {activeTab === "promos" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Add Promo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 font-display mb-5">Create Promo Code</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Code</label>
                  <input
                    value={promoForm.code}
                    onChange={(e) => setPromoForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. HACKATHON25"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-mono font-bold tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Type</label>
                    <select
                      value={promoForm.type}
                      onChange={(e) => setPromoForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="AMOUNT">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                      {promoForm.type === "PERCENT" ? "Discount %" : "Amount ₹"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={promoForm.value}
                      onChange={(e) => setPromoForm((p) => ({ ...p, value: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>
                {promoError && <p className="text-xs text-red-600 font-medium">{promoError}</p>}
                <button
                  type="button"
                  onClick={handleAddPromo}
                  className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 transition-colors text-sm"
                >
                  Add Promo Code
                </button>
              </div>
            </div>

            {/* Promo List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 font-display">Active Codes</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {promoCodes.slice(0, 12).map((p) => (
                  <div key={p.code} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 font-mono tracking-widest">{p.code}</p>
                        <p className="text-xs text-slate-500">{p.type === "PERCENT" ? `${p.value}% off` : `₹${p.value} off`}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePromoCode(p.code)}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {!promoCodes.length && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-700">No promo codes yet</p>
                    <p className="text-xs text-slate-400 mt-1">Create one using the form on the left</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
