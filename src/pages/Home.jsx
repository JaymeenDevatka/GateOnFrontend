import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import EventCard from '../components/event/EventCard.jsx';
import EventMap from '../components/event/EventMap.jsx';
import { useEventContext } from '../context/EventContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Home() {
  const { events } = useEventContext();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  const handleLinkClick = (e, path) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: path } } });
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 lg:pb-32 overflow-visible">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -ml-[50vw] w-[100vw] h-full z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand/10 blur-[100px] animate-blob mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/10 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[50%] rounded-full bg-orange-200/20 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
        </div>

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm animate-fade-in opacity-0 hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0ms' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-wider uppercase">The new standard for events</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
                Host, share, <br className="hidden lg:block" />
                <span className="text-gradient animate-gradient-x bg-[length:200%_auto]">attend.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
                GateOn is the all-in-one platform for modern events. Vivid pages, seamless ticketing, and an experience your attendees will love.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up opacity-0" style={{ animationDelay: '300ms' }}>
                <Button
                  onClick={() => handleButtonClick('/create-event')}
                  className="w-full sm:w-auto h-12 text-base px-8"
                >
                  Get Started
                </Button>
                <Button
                  variant="glass"
                  onClick={() => handleButtonClick('/events')}
                  className="w-full sm:w-auto h-12 text-base px-8"
                >
                  Browse Events
                </Button>
              </div>

              <p className="text-sm text-slate-400 font-medium animate-slide-up opacity-0 flex items-center justify-center lg:justify-start gap-2" style={{ animationDelay: '400ms' }}>
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Free 14-day trial, no credit card required.
              </p>
            </div>

            {/* Visual/Map */}
            <div className="relative animate-scale-in opacity-0" style={{ animationDelay: '400ms' }}>
              <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-4 border border-white/50 shadow-2xl shadow-brand/10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                <div className="rounded-[2rem] overflow-hidden shadow-inner">
                  <EventMap />
                </div>

                {/* Floating Cards simulating activity */}
                <div className="absolute -left-8 top-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-card animate-float hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                      <span className="text-xl">🎉</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">New Event</p>
                      <p className="text-sm font-bold text-slate-900">Tech Meetup 2024</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-6 bottom-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-card animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-green-200"></div>
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-200"></div>
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-purple-200"></div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">+42 attending</p>
                  </div>
                </div>
              </div>
              {/* Background Glow behind map */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand to-secondary blur-3xl opacity-20 -z-10 transform scale-110" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container-page">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Trending near you</h2>
            <p className="text-slate-500 mt-2 text-lg">Discover the most popular events happenning this weekend.</p>
          </div>
          <Link
            to="/events"
            onClick={(e) => handleLinkClick(e, '/events')}
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark transition-colors group"
          >
            Explore all
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div key={event.id} className="opacity-0 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Button variant="outline" onClick={() => handleButtonClick('/events')} className="w-full">
            Explore all events
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Home;
