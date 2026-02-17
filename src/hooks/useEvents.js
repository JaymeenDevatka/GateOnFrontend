import { useMemo, useState } from "react";
import { useEventContext } from "../context/EventContext.jsx";

export default function useEvents() {
  const { events } = useEventContext();
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    category: "",
    price: "",
    venueType: "",
    trending: "",
    minRating: "",
    sportType: "",
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (e.status && e.status !== "published") return false;
      if (
        filters.query &&
        !e.title.toLowerCase().includes(filters.query.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.location &&
        !String(e.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (filters.category && e.category !== filters.category) return false;
      if (filters.price === "free" && e.price !== 0) return false;
      if (filters.price === "paid" && e.price === 0) return false;

      if (filters.venueType && e.venueType !== filters.venueType) return false;

      if (filters.trending === "trending" && !e.trending) return false;

      if (filters.minRating) {
        const min = Number(filters.minRating) || 0;
        const rating = Number(e.rating) || 0;
        if (rating < min) return false;
      }

      if (filters.sportType) {
        if (String(e.sportType || "") !== String(filters.sportType))
          return false;
      }

      return true;
    });
  }, [events, filters]);

  return { events: filtered, filters, setFilters };
}
