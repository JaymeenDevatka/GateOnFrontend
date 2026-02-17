import { useState } from "react";
import Button from "../components/common/Button.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useEventContext } from "../context/EventContext.jsx";

function CheckIn() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const { checkInBooking } = useBookingContext();
  const { getEventById } = useEventContext();

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    const normalized = code.trim().toUpperCase();

    const res = await checkInBooking(normalized);
    if (!res.ok) {
      setResult({
        status: "error",
        message: res.error || "Unable to check in.",
      });
      return;
    }

    const booking = res.booking;

    const event = getEventById(booking.eventId);
    setResult({
      status: "success",
      message:
        "Check-in successful. Entry recorded and duplicate use prevented.",
      details: {
        bookingId: booking.id,
        eventTitle: event?.title || "Event",
        attendee:
          `${booking.attendee?.firstName || ""} ${booking.attendee?.lastName || ""}`.trim() ||
          booking.attendee?.email ||
          "Attendee",
      },
    });
  };

  return (
    <div className="container-page max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Event check-in</h1>
        <p className="text-sm text-slate-500">
          Scan a QR/Barcode or enter a booking ID to validate entry –
          frontend-only simulation.
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
            placeholder="Scan or paste code (e.g. bkg_xxxxx)"
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
            result.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <p>{result.message}</p>
          {result.status === "success" && result.details && (
            <div className="mt-2 text-xs text-emerald-900/80 space-y-1">
              <p>
                <span className="font-semibold">Event:</span>{" "}
                {result.details.eventTitle}
              </p>
              <p>
                <span className="font-semibold">Attendee:</span>{" "}
                {result.details.attendee}
              </p>
              <p>
                <span className="font-semibold">Booking ID:</span>{" "}
                {result.details.bookingId}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckIn;
