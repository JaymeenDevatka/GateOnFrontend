import { useState, useRef, useEffect } from "react";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function toDateObj(str) {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDisplay(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    return `${m}/${d}/${y}`;
}

function isSameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isInRange(day, start, end) {
    if (!start || !end) return false;
    const s = start < end ? start : end;
    const e = start < end ? end : start;
    return day > s && day < e;
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(null);
    const containerRef = useRef(null);

    const startObj = toDateObj(startDate);
    const endObj = toDateObj(endDate);

    // Determine selection phase: if no start, or both set, next click = start
    const phase = !startDate || (startDate && endDate) ? "start" : "end";

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Build calendar days
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday-based: 0=Mon, 6=Sun
    let startWeekday = firstDay.getDay(); // 0=Sun
    startWeekday = (startWeekday + 6) % 7; // shift so Mon=0

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    function handleDayClick(day) {
        if (phase === "start") {
            onStartChange(toDateStr(day));
            onEndChange(""); // reset end
        } else {
            // Ensure end >= start
            if (startObj && day < startObj) {
                onStartChange(toDateStr(day));
                onEndChange(startDate);
            } else {
                onEndChange(toDateStr(day));
                setOpen(false); // close after full selection
            }
        }
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    // Display value
    let displayValue = "";
    if (startDate && endDate) {
        displayValue = `${formatDisplay(startDate)} — ${formatDisplay(endDate)}`;
    } else if (startDate) {
        displayValue = formatDisplay(startDate);
    }

    // Effective end for hover preview
    const effectiveEnd = endObj || hovered;

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger */}
            <fieldset
                className="border border-slate-300 rounded-lg px-3 pb-2 pt-1 hover:border-brand transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand cursor-pointer"
                onClick={() => setOpen(o => !o)}
            >
                <legend className="text-xs font-medium text-slate-500 px-1">Date</legend>
                <div className="flex items-center gap-2 py-1">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm ${displayValue ? "text-slate-900" : "text-slate-400"}`}>
                        {displayValue || "Select dates"}
                    </span>
                </div>
            </fieldset>

            {/* Calendar Dropdown */}
            {open && (
                <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-80 animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-bold text-slate-900">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} />;

                            const isStart = startObj && isSameDay(day, startObj);
                            const isEnd = endObj && isSameDay(day, endObj);
                            const inRange = isInRange(day, startObj, effectiveEnd);
                            const isToday = isSameDay(day, today);
                            const isPast = day < today && !isSameDay(day, today);

                            let cellClass = "relative flex items-center justify-center h-9 text-sm cursor-pointer select-none transition-colors";
                            let innerClass = "w-8 h-8 flex items-center justify-center rounded-full z-10 relative transition-all";
                            let rangeClass = "absolute inset-y-0 left-0 right-0";

                            if (isStart || isEnd) {
                                innerClass += " bg-brand text-white font-bold shadow-md";
                            } else if (inRange) {
                                innerClass += " text-brand font-medium";
                            } else if (isPast) {
                                innerClass += " text-slate-300 cursor-not-allowed";
                            } else if (isToday) {
                                innerClass += " text-brand font-bold";
                            } else {
                                innerClass += " text-slate-700 hover:bg-brand/10 hover:text-brand";
                            }

                            // Range highlight background
                            let rangeBg = "";
                            if (inRange) rangeBg = "bg-brand/10";
                            if (isStart && effectiveEnd && startObj < effectiveEnd) rangeBg = "bg-brand/10 rounded-l-full";
                            if (isEnd && startObj && startObj < endObj) rangeBg = "bg-brand/10 rounded-r-full";
                            if (isStart && isEnd) rangeBg = "";

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cellClass}
                                    onClick={() => !isPast && handleDayClick(day)}
                                    onMouseEnter={() => phase === "end" && setHovered(day)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <div className={`${rangeClass} ${rangeBg}`} />
                                    <div className={innerClass}>{day.getDate()}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            {phase === "start" ? "Click to set start date" : "Click to set end date"}
                        </span>
                        <button
                            type="button"
                            onClick={() => { onStartChange(""); onEndChange(""); }}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
