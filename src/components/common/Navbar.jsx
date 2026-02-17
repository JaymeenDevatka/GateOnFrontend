import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinkClasses = ({ isActive }) =>
  `text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
    isActive
      ? "bg-brand/10 text-brand font-semibold"
      : "text-slate-600 hover:text-brand hover:bg-slate-50"
  }`;

function Navbar() {
  const { user, role, setRole, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, path) => {
    if (path === "/events") return;
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
      <nav className="container-page flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand/30 group-hover:scale-105 transition-transform duration-300">
            G
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 text-base tracking-tight group-hover:text-brand transition-colors">
              GateOn
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Events & tickets
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/events" className={navLinkClasses}>
            Browse events
          </NavLink>
          {(hasRole(["Admin", "Event Manager"]) || !user) && (
            <NavLink
              to="/create-event"
              className={navLinkClasses}
              onClick={(e) => handleNavClick(e, "/create-event")}
            >
              Create event
            </NavLink>
          )}
          {(hasRole(["Admin", "Event Manager"]) || !user) && (
            <NavLink
              to="/organizer"
              className={navLinkClasses}
              onClick={(e) => handleNavClick(e, "/organizer")}
            >
              Organizer
            </NavLink>
          )}
          <NavLink
            to="/attendee"
            className={navLinkClasses}
            onClick={(e) => handleNavClick(e, "/attendee")}
          >
            My tickets
          </NavLink>
          {(hasRole(["Admin", "Event Manager", "Volunteer"]) || !user) && (
            <NavLink
              to="/check-in"
              className={navLinkClasses}
              onClick={(e) => handleNavClick(e, "/check-in")}
            >
              Check-in
            </NavLink>
          )}
          {(hasRole(["Admin", "Event Manager"]) || !user) && (
            <NavLink
              to="/analytics"
              className={navLinkClasses}
              onClick={(e) => handleNavClick(e, "/analytics")}
            >
              Analytics
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="hidden sm:inline-flex text-xs border border-slate-200 rounded-full px-3 py-2 bg-white"
                aria-label="Role"
              >
                <option value="Admin">Admin</option>
                <option value="Event Manager">Event Manager</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Attendee">Attendee</option>
              </select>
              <span className="hidden sm:inline-flex text-xs text-slate-600 px-3">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="inline-flex px-4 py-2 text-sm font-medium rounded-full border border-slate-200 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: { pathname: location.pathname } }}
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-full border border-slate-200 hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                state={{ from: { pathname: location.pathname } }}
                className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-brand text-white hover:bg-brand-dark shadow-sm"
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
