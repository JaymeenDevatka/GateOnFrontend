function QRPreview({ eventTitle }) {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 flex flex-col items-center gap-3">
      <div className="w-32 h-32 rounded-xl bg-slate-900 flex items-center justify-center text-xs text-white/70">
        QR Preview
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-900">Mobile ticket</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
          This is a dummy QR preview for <span className="font-medium">{eventTitle}</span>. Replace
          with real QR later.
        </p>
      </div>
    </div>
  );
}

export default QRPreview;

