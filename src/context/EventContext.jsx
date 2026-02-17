import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createEventApi, fetchEvents } from "../services/api.js";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const items = await fetchEvents();
        if (cancelled) return;
        setEvents(items);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Unable to load events.");
        setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeTicketsForApi = (tickets = []) => {
    return tickets.map((t) => ({
      name: t.label || t.name || "Ticket",
      price: Number(t.price) || 0,
      capacity: Number(t.maxQuantity ?? t.capacity) || 0,
    }));
  };

  const createEvent = async (data) => {
    const payload = {
      title: data.title,
      description: data.description || "",
      date: data.date,
      location: data.location,
      venue: data.venue || "",
      venueType: data.venueType || "",
      category: data.category || "",
      sportType: data.sportType || "",
      trending: Boolean(data.trending),
      rating: Number(data.rating) || 0,
      status: data.status || "published",
      ownerId: data.ownerId || "u_local",
      tickets: normalizeTicketsForApi(data.tickets || []),
    };

    const created = await createEventApi(payload);
    setEvents((prev) => [created, ...prev]);
    return created;
  };

  const getEventById = (id) => events.find((e) => String(e.id) === String(id));

  const value = useMemo(
    () => ({ events, loading, error, createEvent, getEventById }),
    [events, loading, error],
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx)
    throw new Error("useEventContext must be used within EventProvider");
  return ctx;
}
