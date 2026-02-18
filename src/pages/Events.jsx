import EventCard from "../components/event/EventCard.jsx";
import EventFilters from "../components/event/EventFilters.jsx";
import EventMap from "../components/event/EventMap.jsx";
import useEvents from "../hooks/useEvents.js";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/common/Button.jsx";

function Events() {
  const { events, filters, setFilters } = useEvents();
  const [view, setView] = useState("list"); // 'list' | 'map'
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [filters, view]);

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const pagedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return events.slice(start, start + pageSize);
  }, [events, page]);

  return (
    <div className="container-page space-y-8 relative">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-brand/20 via-secondary/20 to-brand/20 blur-3xl opacity-50 -z-10 rounded-full" />

      <div className="flex flex-col items-center justify-center pt-12 pb-8 gap-8 text-center relative z-10">
        <div className="space-y-2 animate-slide-up">
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Find your next experience
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Search for events, concerts, sports, and more. Filter by location and category to find exactly what you're looking for.
          </p>
        </div>

        <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <EventFilters value={filters} onChange={setFilters} />
        </div>

        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "list" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            onClick={() => setView("list")}
            type="button"
          >
            List View
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "map" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            onClick={() => setView("map")}
            type="button"
          >
            Map View
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {!events.length && (
            <p className="text-sm text-slate-500 col-span-full">
              No events match these filters. Try clearing them.
            </p>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[3fr,2fr] gap-4 items-start">
          <EventMap />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              Events on map
            </p>
            {pagedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {!events.length && (
              <p className="text-sm text-slate-500">
                No events to show on the map for these filters.
              </p>
            )}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            className="text-xs px-4 py-2"
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            className="text-xs px-4 py-2"
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default Events;
