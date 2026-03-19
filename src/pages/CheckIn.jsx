import { useState } from "react";
import Button from "../components/common/Button.jsx";
import { useBookingContext } from "../context/BookingContext.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Scanner } from '@yudiel/react-qr-scanner';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

function EventCard({ event, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="w-full text-left bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 hover:border-brand hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 group-hover:text-brand truncate">
            {event.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDate(event.date)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {event.venue && (
            <p className="text-xs text-slate-400 mt-0.5">{event.venue}</p>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────

function CheckIn() {
  const { events, loading: eventsLoading } = useEventContext();
  const { checkInBooking, getBookingsByEvent } = useBookingContext();
  const { user } = useAuth();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true); // Default to camera scanner

  // Only show published (live) events created by the current organizer
  const liveEvents = events.filter(
    (e) => {
      const isPublished = !e.status || e.status === "published";
      const isMyEvent = user?.id && e.ownerId === user.id;
      return isPublished && isMyEvent;
    }
  );

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setCode("");
    setResult(null);
  };

  const handleBack = () => {
    setSelectedEvent(null);
    setCode("");
    setResult(null);
  };

  const handleCheck = async (eOrCode) => {
    // Determine if called by form submission (e) or direct code string
    let submitCode = code;
    if (typeof eOrCode === "string") {
      submitCode = eOrCode;
    } else if (eOrCode && eOrCode.preventDefault) {
      eOrCode.preventDefault();
    }
    
    if (!submitCode.trim()) return;

    const normalized = submitCode.trim().toUpperCase();

    const res = await checkInBooking(normalized);
    if (!res.ok) {
      setResult({
        status: "error",
        message: res.error || "Unable to check in.",
      });
      return;
    }

    const booking = res.booking;

    // Verify the booking belongs to the selected event
    if (String(booking.eventId) !== String(selectedEvent.id)) {
      setResult({
        status: "error",
        message: `This ticket is not for "${selectedEvent.title}". Please use the correct ticket code.`,
      });
      return;
    }

    setResult({
      status: "success",
      message: "Check-in successful. Entry recorded and duplicate use prevented.",
      details: {
        ticketCode: booking.ticketCode || booking.id,
        bookingId: booking.id,
        eventTitle: selectedEvent.title,
        attendee:
          `${booking.attendee?.firstName || ""} ${booking.attendee?.lastName || ""}`.trim() ||
          booking.attendee?.email ||
          "Attendee",
      },
    });
    // Don't clear state if we are continuously scanning; 
    // it helps the user see what code just succeeded. Wait 3 seconds to clear the scanner success flash.
    if (!isScanning) {
      setCode("");
    }
  };

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedCode = detectedCodes[0].rawValue;
      if (scannedCode !== code) {
        setCode(scannedCode);
        handleCheck(scannedCode);
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Code scanning error:", error);
  };

  // ── Step 1: Event selection ─────────────────────────────────────────────────
  if (!selectedEvent) {
    return (
      <div className="container-page max-w-2xl space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Event Check-in</h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a live event below to begin checking in attendees.
          </p>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading events…
          </div>
        ) : liveEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            No live events found. You need to create and publish events to check in attendees.
          </div>
        ) : (
          <div className="space-y-3">
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} onSelect={handleSelectEvent} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Step 2: Check-in form for selected event ────────────────────────────────
  return (
    <div className="container-page max-w-xl space-y-5">
      {/* Header with back button */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Back to event list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Event Check-in</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Checking in for:{" "}
            <span className="font-medium text-slate-700">{selectedEvent.title}</span>
          </p>
        </div>
      </div>

      {/* Selected event pill */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800 truncate">
            {selectedEvent.title}
          </p>
          <p className="text-xs text-emerald-600">
            {formatDate(selectedEvent.date)}
            {selectedEvent.location ? ` · ${selectedEvent.location}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium shrink-0 transition-colors"
        >
          Change
        </button>
      </div>

      {/* Check-in form */}
      <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-5 space-y-4">
        
        {/* Toggle Scanner Mode */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            type="button"
            onClick={() => setIsScanning(true)}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${isScanning ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📷 Scan QR Code
          </button>
          <button 
            type="button"
            onClick={() => setIsScanning(false)}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${!isScanning ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ⌨️ Manual Entry
          </button>
        </div>

        {isScanning ? (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border-2 border-slate-200 bg-black aspect-square max-w-sm mx-auto shadow-inner relative">
              <Scanner 
                onScan={handleScan}
                onError={handleError}
                formats={["qr_code"]}
                components={{
                  onOff: true,
                  finder: false, // We use our own styling
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' }
                }}
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                 <div className="w-full h-full border-2 border-brand/80"></div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500">
              Point your camera at the attendee's ticket. It will scan automatically.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleCheck}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Ticket Code / QR code content
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EVT-0001-XXXXXXXX"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono uppercase"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter the ticket code manually if scanning fails.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Validate entry</Button>
            </div>
          </form>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${result.status === "success"
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
                <span className="font-semibold">Ticket Code:</span>{" "}
                <span className="font-mono">{result.details.ticketCode}</span>
              </p>
              <p>
                <span className="font-semibold">Booking ID:</span>{" "}
                <span className="font-mono text-xs">{result.details.bookingId}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckIn;
