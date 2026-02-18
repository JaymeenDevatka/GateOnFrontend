import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import EventCard from "../components/event/EventCard.jsx";
import EventMap from "../components/event/EventMap.jsx";
import { useEventContext } from "../context/EventContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Home() {
  const { events } = useEventContext();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  const handleLinkClick = (e, path) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  return (
    <div className="overflow-hidden min-h-screen pt-12">
      {/* Hero Section */}
      <section className="relative pt-0 pb-12 sm:pt-0 sm:pb-16 lg:pb-20 overflow-visible">
        {/* Background (match reference: dotted wave + warm glows) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-36 -left-36 w-[520px] h-[520px] rounded-full bg-brand/20 blur-[120px] animate-pulse-slow" />
          <div
            className="absolute -bottom-44 -right-44 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[150px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-200/90" />

          {/* Dotted wave illustration */}
          <svg
            className="absolute inset-0 w-full h-full opacity-70"
            viewBox="0 0 1440 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ea580c" stopOpacity="0.55" />
                <stop offset="0.55" stopColor="#f97316" stopOpacity="0.28" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0.35" />
              </linearGradient>
              <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" />
              </filter>
            </defs>

            <g className="animate-float" style={{ transformOrigin: "50% 50%" }}>
              {/* soft mist stroke */}
              <path
                d="M-50,360 C180,220 320,470 520,320 C740,155 880,430 1100,260 C1230,160 1370,200 1490,260"
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="22"
                strokeOpacity="0.08"
                filter="url(#softBlur)"
              />
              {/* dotted stroke */}
              <path
                d="M-50,360 C180,220 320,470 520,320 C740,155 880,430 1100,260 C1230,160 1370,200 1490,260"
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="0 10"
                strokeOpacity="0.55"
              />
              {/* secondary dotted stroke */}
              <path
                d="M-60,385 C160,260 340,505 540,360 C760,200 900,465 1120,300 C1250,205 1390,240 1510,305"
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0 12"
                strokeOpacity="0.35"
              />
            </g>
          </svg>

          {/* small sparkle bottom-right */}
          <div className="absolute bottom-10 right-14 text-slate-300/70 animate-pulse-slow select-none">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2l1.2 5.3L18 8.5l-4.8 1.2L12 15l-1.2-5.3L6 8.5l4.8-1.2L12 2z"
                fill="currentColor"
              />
              <path
                d="M19 13l.6 2.6L22 16l-2.4.6L19 19l-.6-2.4L16 16l2.4-.4L19 13z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-8 lg:gap-10 items-center">
            {/* Content */}
            <div className="space-y-5 text-center lg:text-left">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-slate-300/60 shadow-sm opacity-0 animate-fade-in"
                style={{ animationDelay: "0ms" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                <span className="text-xs font-semibold text-slate-700 tracking-[0.2em] uppercase">
                  Discover amazing events
                </span>
              </div>

              {/* Headline - improved font style with hover effect */}
              <h1
                className="group text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] font-display opacity-0 animate-slide-up"
                style={{
                  animationDelay: "0.2s"
                }}
              >
                <span className="block tracking-tight group-hover:tracking-tighter transition-all duration-300">Host. Share.</span>
                <span className="block">
                  <span className="relative inline-block transition-transform duration-300 group-hover:scale-[1.02] origin-left">
                    <span
                      className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-glow to-secondary bg-[length:200%_auto] animate-gradient-x tracking-tight hover:tracking-wide transition-all duration-300"
                      style={{ animationDuration: "3s" }}
                    >
                      Experience.
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute left-[-4%] right-[-4%] bottom-2 h-4 rounded-full bg-brand/15 blur-[2px]"
                    />
                  </span>
                </span>
              </h1>

              <p className="text-base sm:text-lg font-semibold text-slate-700 tracking-wide max-w-xl mx-auto lg:mx-0">
                Event ticketing & discovery platform — create events, sell tickets, and discover what’s happening near you.
              </p>
              <p
                className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                GateOn is the all-in-one platform for modern events. Create stunning pages, seamless ticketing, and moments that matter.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 opacity-0 animate-slide-up"
                style={{
                  animationDelay: "0.6s"
                }}
              >
                <Button
                  variant="glow"
                  onClick={() => handleButtonClick("/create-event")}
                  className="w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg px-9 sm:px-10 shadow-glow hover:shadow-glow-lg hover:scale-[1.03] transition-all duration-300"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleButtonClick("/events")}
                  className="w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg px-8 bg-white/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 hover:scale-[1.03] transition-all duration-300"
                >
                  Browse Events
                </Button>
              </div>

              <div
                className="flex items-center justify-center lg:justify-start gap-6 pt-2 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-transform duration-300"
                    >
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-600">
                  <span className="text-brand font-bold text-xl">2k+</span> events hosted
                </div>
              </div>
            </div>

            {/* Right: tilted photo/map card */}
            <div
              className="relative lg:h-[500px] flex items-center justify-center opacity-0 animate-scale-in"
              style={{
                animationDelay: "0.3s"
              }}
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-10 bg-brand/10 blur-3xl rounded-[3rem] pointer-events-none" />

                <div className="relative rotate-[10deg] hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="relative bg-white rounded-[2.4rem] p-4 sm:p-5 shadow-2xl border border-white/70">
                    <div className="relative rounded-[1.9rem] overflow-hidden">
                      <EventMap />
                      {/* reflection */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/35 via-transparent to-white/10 opacity-80 mix-blend-overlay" />
                      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-white/25 rotate-12 blur-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Events Section */}
      <section className="py-12 container-page relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display mb-4">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-secondary">Events</span>
            </h2>
            <p className="text-slate-600 text-lg">
              Discover the most popular experiences happening this weekend. Don't miss out.
            </p>
          </div>
          <Link
            to="/events"
            onClick={(e) => handleLinkClick(e, "/events")}
            className="inline-flex items-center gap-2 font-bold text-brand hover:text-brand-dark transition-colors px-6 py-3 rounded-full bg-brand-light/30 hover:bg-brand-light/50 border border-brand/20"
          >
            Explore all
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {events
            .filter((e) => (!e.status || e.status === "published"))
            .slice(0, 6)
            .map((event, index) => (
              <div
                key={event.id}
                className="opacity-0 animate-slide-up h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
        </div>

        {events.filter((e) => (!e.status || e.status === "published")).length === 0 && (
          <div className="text-center py-20 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-slate-600 text-lg">
              No events right now. Check back soon or{" "}
              <span className="text-brand cursor-pointer hover:underline font-bold" onClick={() => handleButtonClick("/events")}>
                explore all events
              </span>
              .
            </p>
          </div>
        )}

        <div className="mt-12 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => handleButtonClick("/events")}
            className="w-full"
          >
            Explore all events
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Home;
