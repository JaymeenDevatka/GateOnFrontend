function OrganizerStats({ stats }) {
  const items = [
    { label: 'Live events', value: stats.liveEvents },
    { label: 'Tickets sold', value: stats.ticketsSold },
    { label: 'This week views', value: stats.views }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card px-4 py-3 flex flex-col gap-1"
        >
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            {item.label}
          </span>
          <span className="text-sm font-semibold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default OrganizerStats;

