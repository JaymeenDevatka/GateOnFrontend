import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function EventCard({ event }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: `/events/${event.id}` } } });
    }
  };

  return (
    <Link
      to={`/events/${event.id}`}
      onClick={handleClick}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-2 hover:border-brand/30 transition-all duration-300 will-change-transform h-full"
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-glow to-secondary transition-transform duration-700 group-hover:scale-110" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-lg group-hover:bg-brand/80 group-hover:border-brand transition-colors">
            {event.category}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 group-hover:border-brand/50 group-hover:bg-brand group-hover:text-white transition-all">
            <span className="text-sm font-bold text-slate-900 group-hover:text-white">
              {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2 group-hover:text-brand-dark transition-colors">
            {event.date}
          </p>
          <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-brand transition-colors font-display line-clamp-2">
            {event.title}
          </h3>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600 group-hover:border-brand/20 transition-colors">
          <div className="flex items-center gap-1.5 overflow-hidden group-hover:text-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-brand">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.006.003.002.001.003.001a.75.75 0 01-.01-.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pl-2 group-hover:text-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand">
              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-2.923-6.16 5 5 0 113.568 7.079A1.25 1.25 0 0114.5 16z" />
            </svg>
            <span className="font-semibold">{event.attendees}+</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
