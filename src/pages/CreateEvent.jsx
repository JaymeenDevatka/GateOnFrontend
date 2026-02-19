import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import DateRangePicker from "../components/common/DateRangePicker.jsx";
import TimePicker from "../components/common/TimePicker.jsx";

function CreateEvent() {
  const { createEvent } = useEventContext();
  const { user, setUserFromApi } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    locationType: "venue", // "venue" | "online" | "tba"
    category: "Tech",
    price: 0,
    status: "published", // or 'draft'
    isOnline: false,
    liveLink: "",
  });
  const [tickets, setTickets] = useState([
    {
      id: "general",
      label: "General",
      price: 0,
      maxQuantity: 100,
    },
  ]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTicket = (id, field, value) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const addTicket = () => {
    setTickets((prev) => [
      ...prev,
      {
        id: `t-${prev.length + 1}`,
        label: "New ticket",
        price: 0,
        maxQuantity: 50,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const minTicketPrice = tickets.length
      ? Math.min(...tickets.map((t) => Number(t.price) || 0))
      : Number(form.price) || 0;

    const normalizedTickets = tickets.map((t) => ({
      ...t,
      description: t.description || "",
    }));

    const startDateTime = `${form.startDate}T${form.startTime}`;
    const isOnline = form.locationType === "online";
    const venueType =
      form.locationType === "online" ? "Online" :
        form.locationType === "tba" ? "To be announced" : "In person";

    await createEvent({
      ...form,
      date: startDateTime,
      startDate: startDateTime,
      endDate: `${form.endDate}T${form.endTime}`,
      price: minTicketPrice,
      isOnline,
      venueType,
      trending: false,
      rating: 0,
      ownerId: user?.id ?? null,
      tickets: normalizedTickets,
    });
    if (user) {
      setUserFromApi({ ...user, role: "EventManager" });
    }
    navigate("/organizer");
  };

  return (
    <div className="container-page max-w-6xl py-12">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight">
          Create an Experience
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Craft your event details and manage tickets in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand rounded-full"></span>
              Basic Details
            </h2>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Event Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Tech Conference 2024"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                >
                  <option value="Tech">Tech</option>
                  <option value="Music">Music</option>
                  <option value="Business">Business</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food & Drink</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={5}
                  placeholder="Tell people what makes your event special..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Date & Time Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm relative z-10">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand rounded-full"></span>
              Date & Time
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Range Picker */}
              <div className="flex-[2]">
                <DateRangePicker
                  startDate={form.startDate}
                  endDate={form.endDate}
                  onStartChange={(v) => update("startDate", v)}
                  onEndChange={(v) => update("endDate", v)}
                />
              </div>

              {/* Time Pickers */}
              <div className="flex-1 flex gap-3">
                <TimePicker
                  label="Start time"
                  value={form.startTime}
                  onChange={(v) => update("startTime", v)}
                />
                <TimePicker
                  label="End time"
                  value={form.endTime}
                  onChange={(v) => update("endTime", v)}
                  minValue={form.startTime}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 pl-1">GMT+05:30</p>
          </div>

          {/* Location Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand rounded-full"></span>
              Location
            </h2>

            {/* Location Type Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
              {[
                {
                  key: "venue", label: "Venue", icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )
                },
                {
                  key: "online", label: "Online event", icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )
                },
                {
                  key: "tba", label: "To be announced", icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )
                },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("locationType", key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${form.locationType === key
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Venue Input */}
            {form.locationType === "venue" && (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  required
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Location *"
                  className="w-full bg-transparent text-base focus:outline-none"
                />
              </div>
            )}

            {/* Online Event Input */}
            {form.locationType === "online" && (
              <div className="space-y-3 animate-slide-up">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  <input
                    value={form.liveLink}
                    onChange={(e) => update("liveLink", e.target.value)}
                    placeholder="Live stream URL (Zoom, YouTube, etc.)"
                    className="w-full bg-transparent text-base focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 pl-1">Attendees will receive a link to join virtually.</p>
              </div>
            )}

            {/* To Be Announced */}
            {form.locationType === "tba" && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-slide-up">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-amber-700">Location will be announced to attendees at a later date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tickets & Settings */}
        <div className="space-y-6">

          {/* Ticket Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand rounded-full"></span>
              Tickets
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Ticket Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Set to 0 for free events.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Total Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={tickets[0].maxQuantity}
                  onChange={(e) => updateTicket(tickets[0].id, "maxQuantity", Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  placeholder="e.g. 100"
                />
                <p className="text-xs text-slate-500 mt-1">Maximum number of attendees.</p>
              </div>
            </div>
          </div>

          {/* Publish Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-4">Publishing</h2>

            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => update("status", "draft")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${form.status === 'draft' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => update("status", "published")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${form.status === 'published' ? 'bg-green-100 text-green-700 border border-green-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Public
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" variant="glow" className="w-full h-12 text-base shadow-lg shadow-brand/20">
                {form.status === "draft" ? "Save Draft" : "Publish Event"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="w-full text-slate-500">
                Cancel
              </Button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
