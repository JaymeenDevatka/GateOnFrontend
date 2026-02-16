import { useMemo, useState } from 'react';
import { useEventContext } from '../context/EventContext.jsx';

export default function useEvents() {
  const { events } = useEventContext();
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    price: ''
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.query && !e.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.category && e.category !== filters.category) return false;
      if (filters.price === 'free' && e.price !== 0) return false;
      if (filters.price === 'paid' && e.price === 0) return false;
      return true;
    });
  }, [events, filters]);

  return { events: filtered, filters, setFilters };
}

