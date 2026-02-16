import EventCard from '../components/event/EventCard.jsx';
import EventFilters from '../components/event/EventFilters.jsx';
import EventMap from '../components/event/EventMap.jsx';
import useEvents from '../hooks/useEvents.js';
import { useState } from 'react';

function Events() {
  const { events, filters, setFilters } = useEvents();
  const [view, setView] = useState('list'); // 'list' | 'map'

  return (
    <div className="container-page space-y-5">
      <div className="flex items-center justify-between pt-1 gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Browse events</h1>
          <p className="text-sm text-slate-500">
            Filter by category, price, or switch to map view to see events as pins.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-surface-elevated p-1 text-xs shadow-sm">
          <button
            className={`px-3 py-1.5 rounded-full ${
              view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-700'
            }`}
            onClick={() => setView('list')}
            type="button"
          >
            List
          </button>
          <button
            className={`px-3 py-1.5 rounded-full ${
              view === 'map' ? 'bg-slate-900 text-white' : 'text-slate-700'
            }`}
            onClick={() => setView('map')}
            type="button"
          >
            Map
          </button>
        </div>
      </div>

      <EventFilters value={filters} onChange={setFilters} />

      {view === 'list' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
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
            <p className="text-xs font-semibold text-slate-700">Events on map</p>
            {events.map((event) => (
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
    </div>
  );
}

export default Events;

