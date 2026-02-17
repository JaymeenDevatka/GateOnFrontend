import Button from '../common/Button.jsx';

function TicketSelector({ tickets, selectedId, onSelect }) {
  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
            selectedId === t.id
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <div>
            <p className="text-sm font-semibold">{t.name}</p>
            <p
              className={`text-xs ${
                selectedId === t.id ? 'text-white/80' : 'text-slate-500'
              }`}
            >
              {t.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {t.price === 0 ? 'Free' : `₹${t.price.toLocaleString()}`}
            </span>
            <span
              className={`text-[11px] px-2 py-1 rounded-full ${
                selectedId === t.id ? 'bg-white/15' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.remaining} left
            </span>
          </div>
        </button>
      ))}
      <div className="flex justify-end pt-2">
        <Button variant="outline" className="text-xs px-3 py-1.5">
          + Add promo code
        </Button>
      </div>
    </div>
  );
}

export default TicketSelector;

