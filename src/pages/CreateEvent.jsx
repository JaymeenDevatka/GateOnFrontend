import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function CreateEvent() {
  const { createEvent } = useEventContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
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
      saleStart: "",
      saleEnd: "",
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
        saleStart: "",
        saleEnd: "",
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

    await createEvent({
      ...form,
      price: minTicketPrice,
      venueType: form.isOnline ? "Online" : "In person",
      trending: false,
      rating: 0,
      ownerId: user?.id || "user-1",
      tickets: normalizedTickets,
    });
    navigate("/organizer");
  };

  return (
    <div className="container-page max-w-3xl">
      <div className="space-y-1 mb-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Create an event
        </h1>
        <p className="text-sm text-slate-500">
          This mirrors the Eventbrite organizer flow but saves everything only
          in the backend JSON database for now.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-5 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Event title
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Tell people what this event is about."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Date & time
            </label>
            <input
              required
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              placeholder="Fri, Mar 10 · 7:00 PM"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="Tech">Tech</option>
              <option value="Music">Music</option>
              <option value="Business">Business</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Location</label>
          <input
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="City · Venue name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="space-y-1 max-w-xs">
          <label className="text-xs font-medium text-slate-700">
            Base ticket price (₹)
          </label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-[11px] text-slate-500">Set 0 for a free event.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">
            Ticket types
          </label>
          <p className="text-[11px] text-slate-500">
            Configure multiple ticket tiers (General, VIP, Student, Early Bird)
            with price, sale window and capacity.
          </p>
          <div className="space-y-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="grid md:grid-cols-[1.5fr,1fr,1fr,1fr] gap-2 border border-slate-200 rounded-xl px-3 py-2"
              >
                <input
                  value={t.label}
                  onChange={(e) => updateTicket(t.id, "label", e.target.value)}
                  placeholder="Ticket name"
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <input
                  type="number"
                  min="0"
                  value={t.price}
                  onChange={(e) =>
                    updateTicket(t.id, "price", Number(e.target.value))
                  }
                  placeholder="Price (₹)"
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <input
                  type="number"
                  min="1"
                  value={t.maxQuantity}
                  onChange={(e) =>
                    updateTicket(t.id, "maxQuantity", Number(e.target.value))
                  }
                  placeholder="Max qty"
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <div className="flex flex-col gap-1">
                  <input
                    value={t.saleStart}
                    onChange={(e) =>
                      updateTicket(t.id, "saleStart", e.target.value)
                    }
                    placeholder="Sale start"
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <input
                    value={t.saleEnd}
                    onChange={(e) =>
                      updateTicket(t.id, "saleEnd", e.target.value)
                    }
                    placeholder="Sale end"
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTicket}
            className="text-[11px] font-medium text-brand hover:text-brand-dark"
          >
            + Add ticket type
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">
            Online / live streaming
          </label>
          <div className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="isOnline"
              checked={form.isOnline}
              onChange={(e) => update("isOnline", e.target.checked)}
            />
            <label htmlFor="isOnline" className="text-slate-600">
              This is an online or hybrid event with a live stream.
            </label>
          </div>
          {form.isOnline && (
            <input
              value={form.liveLink}
              onChange={(e) => update("liveLink", e.target.value)}
              placeholder="Live stream URL (YouTube, Zoom, etc.)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Status</label>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => update("status", "draft")}
              className={`px-3 py-1.5 rounded-full ${
                form.status === "draft"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700"
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => update("status", "published")}
              className={`px-3 py-1.5 rounded-full ${
                form.status === "published"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700"
              }`}
            >
              Publish
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Draft events stay private in your dashboard; published ones are
            discoverable.
          </p>
        </div>

        <div className="pt-3 flex justify-end gap-3">
          <Button variant="ghost" type="button">
            Cancel
          </Button>
          <Button type="submit">
            {form.status === "draft" ? "Save draft" : "Publish event"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
