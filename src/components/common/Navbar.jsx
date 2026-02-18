import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState, useEffect } from "react";

const navLinkClasses = ({ isActive }) =>
  `relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full ${isActive
    ? "text-white bg-brand shadow-sm border border-brand/40"
    : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
  }`;

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, path) => {
    if (path === "/events") return;
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "shadow-lg bg-slate-800/98 backdrop-blur-md" : "bg-slate-800/95 backdrop-blur-sm"
        }`}
    >
      <nav className="container-page flex items-center justify-between py-2.5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-auto flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 object-cover rounded-full drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col leading-none hidden sm:flex">
            <span className="font-display font-bold text-white text-lg tracking-tight group-hover:text-brand-light transition-colors">
              GateOn
            </span>
            <span className="text-xs text-slate-400">Events & Tickets</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 bg-slate-700/60 p-1.5 rounded-full border border-slate-600/50 backdrop-blur-sm">
          <NavLink to="/events" className={navLinkClasses}>
            Browse events
          </NavLink>
          <NavLink
            to="/create-event"
            className={navLinkClasses}
            onClick={(e) => handleNavClick(e, "/create-event")}
          >
            Create event
          </NavLink>
          <NavLink
            to="/organizer"
            className={navLinkClasses}
            onClick={(e) => handleNavClick(e, "/organizer")}
          >
            Organizer
          </NavLink>
          <NavLink
            to="/attendee"
            className={navLinkClasses}
            onClick={(e) => handleNavClick(e, "/attendee")}
          >
            My tickets
          </NavLink>
          <NavLink
            to="/check-in"
            className={navLinkClasses}
            onClick={(e) => handleNavClick(e, "/check-in")}
          >
            Check-in
          </NavLink>

        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline-flex text-sm text-slate-200 font-medium px-3">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="inline-flex px-5 py-2.5 text-sm font-bold rounded-full border-2 border-slate-500 bg-slate-700/50 text-slate-200 hover:border-brand hover:text-white hover:bg-slate-600/50 transition-all"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: { pathname: location.pathname } }}
                className="hidden sm:inline-flex px-5 py-2.5 text-sm font-bold rounded-full text-slate-200 hover:text-white hover:bg-slate-600/50 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                state={{ from: { pathname: location.pathname } }}
                className="inline-flex px-6 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30 hover:shadow-glow hover:scale-105 transition-all duration-300"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
