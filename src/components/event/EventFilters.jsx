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
        onChange={(e) => update('query', e.target.value)}
      />
      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[120px]"
        value={value.category}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">All categories</option>
        <option value="Tech">Tech</option>
        <option value="Music">Music</option>
        <option value="Business">Business</option>
        <option value="Sports">Sports</option>
      </select>
      <select
        className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-surface-elevated min-w-[120px]"
        value={value.price}
        onChange={(e) => update('price', e.target.value)}
      >
        <option value="">Any price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>
    </div>
  );
}

export default EventFilters;

