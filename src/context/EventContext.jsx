import { createContext, useContext, useState } from 'react';
import { MOCK_EVENTS } from '../utils/constants.js';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState(MOCK_EVENTS);

  const createEvent = (data) => {
    const newEvent = {
      ...data,
      id: String(events.length + 1),
      attendees: 0
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const getEventById = (id) => events.find((e) => e.id === id);

  return (
    <EventContext.Provider value={{ events, createEvent, getEventById }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventContext must be used within EventProvider');
  return ctx;
}

