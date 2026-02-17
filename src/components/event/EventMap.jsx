function EventMap() {
  return (
    <div className="rounded-3xl h-72 relative overflow-hidden shadow-card group">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
        alt="City Map Background" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-start justify-between p-6 text-white">
        <div className="transform transition-transform duration-300 group-hover:translate-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wide mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
            Live Map
          </div>
          <h3 className="text-xl font-display font-bold leading-tight">Popular in <br/>your city</h3>
        </div>
        
        <div className="space-y-3 transform transition-all duration-300 group-hover:-translate-y-1">
          <p className="text-xs text-slate-200/90 font-medium max-w-[80%] leading-relaxed">
            Discover trending events happening around you right now.
          </p>
          <button className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-brand hover:text-white transition-colors duration-300 shadow-lg">
            View Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventMap;

