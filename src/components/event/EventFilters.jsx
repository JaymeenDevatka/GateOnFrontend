function EventFilters({ value, onChange }) {
  const update = (field, newValue) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search for events"
        className="flex-1 min-w-[160px] border border-slate-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        value={value.query}
        onChange={(e) => update("query", e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        className="min-w-[160px] border border-slate-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        value={value.location}
        onChange={(e) => update("location", e.target.value)}
      />
      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[120px]"
        value={value.category}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">All categories</option>
        <option value="Tech">Tech</option>
        <option value="Music">Music</option>
        <option value="Business">Business</option>
        <option value="Sports">Sports</option>
      </select>
      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[140px]"
        value={value.venueType}
        onChange={(e) => update("venueType", e.target.value)}
      >
        <option value="">Any venue</option>
        <option value="In person">In person</option>
        <option value="Online">Online</option>
      </select>
      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[120px]"
        value={value.price}
        onChange={(e) => update("price", e.target.value)}
      >
        <option value="">Any price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>

      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[130px]"
        value={value.trending}
        onChange={(e) => update("trending", e.target.value)}
      >
        <option value="">Any</option>
        <option value="trending">Trending</option>
      </select>

      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[130px]"
        value={value.minRating}
        onChange={(e) => update("minRating", e.target.value)}
      >
        <option value="">Any rating</option>
        <option value="4">4.0+</option>
        <option value="4.5">4.5+</option>
      </select>

      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[140px]"
        value={value.sportType}
        onChange={(e) => update("sportType", e.target.value)}
      >
        <option value="">Any sport</option>
        <option value="Cricket">Cricket</option>
        <option value="Football">Football</option>
        <option value="Badminton">Badminton</option>
        <option value="Running">Running</option>
        <option value="Basketball">Basketball</option>
      </select>
    </div>
  );
}

export default EventFilters;
