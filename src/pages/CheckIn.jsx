import { useState } from 'react';
import Button from '../components/common/Button.jsx';

function CheckIn() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    // Dummy validation – in real app this would call backend
    const isValid = code.trim().toLowerCase().startsWith('evh');
    setResult({
      status: isValid ? 'success' : 'error',
      message: isValid
        ? 'Check-in successful. Entry recorded and duplicate use prevented.'
        : 'Invalid or already used code. Please verify the ticket.'
    });
  };

  return (
    <div className="container-page max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Event check-in</h1>
        <p className="text-sm text-slate-500">
          Scan a QR/Barcode or enter a booking ID to validate entry – frontend-only simulation.
        </p>
      </div>

      <form
        onSubmit={handleCheck}
        className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-5 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Booking ID / QR code content
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan or paste code (e.g. EVH-1234-5678)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Validate entry</Button>
        </div>
      </form>

      {result && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            result.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}

export default CheckIn;

