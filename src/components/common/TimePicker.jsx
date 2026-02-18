import { useState, useRef, useEffect } from "react";

// Generate all 30-min interval times in 12h format
function generateTimes() {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? "AM" : "PM";
            const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
            const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            times.push({ label, value });
        }
    }
    return times;
}

const ALL_TIMES = generateTimes();

function to12h(value) {
    if (!value) return "";
    const [h, m] = value.split(":").map(Number);
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function TimePicker({ value, onChange, label = "Time", minValue }) {
    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState(to12h(value));
    const containerRef = useRef(null);
    const listRef = useRef(null);

    // Sync inputText when value changes externally
    useEffect(() => {
        setInputText(to12h(value));
    }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                // Restore to last valid value if input is invalid
                setInputText(to12h(value));
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    // Scroll selected item into view when dropdown opens
    useEffect(() => {
        if (open && listRef.current && value) {
            const selected = listRef.current.querySelector("[data-selected='true']");
            if (selected) {
                selected.scrollIntoView({ block: "center" });
            }
        }
    }, [open, value]);

    // Filter times based on minValue
    const filteredTimes = minValue
        ? ALL_TIMES.filter((t) => t.value > minValue)
        : ALL_TIMES;

    function handleSelect(t) {
        onChange(t.value);
        setInputText(t.label);
        setOpen(false);
    }

    function handleInputChange(e) {
        setInputText(e.target.value);
    }

    function handleInputBlur() {
        // Try to parse typed input
        const match = inputText.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && h !== 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                const newVal = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                onChange(newVal);
                setInputText(to12h(newVal));
                return;
            }
        }
        // Revert to last valid
        setInputText(to12h(value));
    }

    return (
        <div className="relative" ref={containerRef}>
            <fieldset
                className={`border rounded-lg px-3 pb-2 pt-1 transition-colors min-w-[110px] ${open
                    ? "border-brand ring-1 ring-brand"
                    : "border-slate-300 hover:border-brand"
                    }`}
            >
                <legend className="text-xs font-medium text-slate-500 px-1">{label}</legend>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onFocus={() => setOpen(true)}
                        placeholder="10:00 AM"
                        className="w-full bg-transparent text-sm text-slate-900 focus:outline-none py-1"
                    />
                </div>
            </fieldset>

            {/* Dropdown */}
            {open && (
                <div
                    ref={listRef}
                    className="absolute z-50 top-full mt-1 left-0 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-y-auto max-h-56 animate-slide-up"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {filteredTimes.map((t) => {
                        const isSelected = t.value === value;
                        return (
                            <div
                                key={t.value}
                                data-selected={isSelected}
                                onMouseDown={() => handleSelect(t)}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected
                                    ? "text-brand font-semibold bg-brand/5"
                                    : "text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {t.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
