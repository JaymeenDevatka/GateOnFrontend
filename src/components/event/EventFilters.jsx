import { useState, useRef, useEffect } from "react";

function EventFilters({ value, onChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  const update = (field, newValue) => {
    onChange({ ...value, [field]: newValue });
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeFiltersCount = [
    value.location,
    value.category,
    value.venueType,
    value.price,
    value.trending,
    value.minRating,
    value.sportType,
  ].filter(Boolean).length;

  return (
    <div className="relative w-full max-w-4xl mx-auto z-40" ref={filterRef}>
      {/* Search Bar Container */}
      <div className="relative flex items-center w-full shadow-lg shadow-slate-200/50 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 transition-all duration-300 hover:shadow-xl hover:border-brand/30 focus-within:ring-4 focus-within:ring-brand/10 focus-within:border-brand">

        {/* Search Icon */}
        <div className="pl-5 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search events, artists, venues..."
          className="flex-1 w-full bg-transparent border-none py-4 px-4 text-slate-700 placeholder:text-slate-400 focus:ring-0 text-base font-medium"
          value={value.query}
          onChange={(e) => update("query", e.target.value)}
          onFocus={() => setShowFilters(false)}
        />

        {/* Filter Trigger Button */}
        <div className="pr-2 py-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${showFilters || activeFiltersCount > 0
                ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`text-xs font-bold px-1.5 rounded-full min-w-[1.25rem] text-center ${showFilters ? "bg-white text-brand" : "bg-brand text-white"}`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showFilters && (
        <div className="absolute top-full mt-4 w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-6 animate-slide-up-sm z-50 ring-1 ring-slate-900/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Location */}
            <div className="space-y-3 col-span-full md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.006.003.002.001.003.001a.75.75 0 01-.01-.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="City or venue..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  value={value.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer hover:bg-slate-100"
                value={value.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Tech">Tech</option>
                <option value="Music">Music</option>
                <option value="Business">Business</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Sport Type */}
            <div className="space-y-3">
              <label className={`text-xs font-bold uppercase tracking-wider transition-colors ${value.category === "Sports" ? "text-slate-500" : "text-slate-300"}`}>Sport</label>
              <select
                className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all ${value.category === "Sports"
                    ? "bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100 placeholder:text-slate-400"
                    : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                value={value.sportType}
                onChange={(e) => update("sportType", e.target.value)}
                disabled={value.category !== "Sports"}
              >
                <option value="">Any Sport</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Badminton">Badminton</option>
                <option value="Running">Running</option>
                <option value="Basketball">Basketball</option>
              </select>
            </div>

            {/* Venue Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Venue</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => update("venueType", "")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!value.venueType ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  Any
                </button>
                <button
                  onClick={() => update("venueType", "In person")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${value.venueType === "In person" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  In Person
                </button>
                <button
                  onClick={() => update("venueType", "Online")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${value.venueType === "Online" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  Online
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => update("price", "")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!value.price ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  Any
                </button>
                <button
                  onClick={() => update("price", "free")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${value.price === "free" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  Free
                </button>
                <button
                  onClick={() => update("price", "paid")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${value.price === "paid" ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Empty col for spacing or future filter */}
            <div className="hidden lg:block"></div>

            {/* Helper Options */}
            <div className="space-y-2 col-span-full border-t border-slate-100 pt-5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${value.trending === "trending" ? "bg-brand border-brand" : "border-slate-300 group-hover:border-brand"}`}>
                    {value.trending === "trending" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={value.trending === "trending"}
                    onChange={(e) => update("trending", e.target.checked ? "trending" : "")}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Trending Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${value.minRating === "4" ? "bg-brand border-brand" : "border-slate-300 group-hover:border-brand"}`}>
                    {value.minRating === "4" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={value.minRating === "4"}
                    onChange={(e) => update("minRating", e.target.checked ? "4" : "")}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Rated 4.0+</span>
                </label>
              </div>

              <button
                onClick={() => {
                  onChange({
                    query: value.query, // Keep query
                    location: "",
                    category: "",
                    venueType: "",
                    price: "",
                    trending: "",
                    minRating: "",
                    sportType: ""
                  });
                }}
                className="text-sm font-bold text-slate-400 hover:text-brand hover:underline transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFilters;
