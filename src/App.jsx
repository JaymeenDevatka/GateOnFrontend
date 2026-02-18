import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import AttendeeDashboard from "./pages/AttendeeDashboard.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function Guard({ children, requireAuth = false, roles = [] }) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  if (roles.length && !hasRole(roles)) {
    return (
      <div className="container-page py-10">
        <p className="text-sm font-semibold text-slate-900">
          Access restricted
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Your current role doesn’t have access to this area.
        </p>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/create-event"
            element={
              <Guard requireAuth roles={["Admin", "Event Manager"]}>
                <CreateEvent />
              </Guard>
            }
          />
          <Route
            path="/checkout"
            element={
              <Guard requireAuth>
                <Checkout />
              </Guard>
            }
          />
          <Route
            path="/organizer"
            element={
              <Guard requireAuth roles={["Admin", "Event Manager"]}>
                <OrganizerDashboard />
              </Guard>
            }
          />
          <Route
            path="/attendee"
            element={
              <Guard requireAuth>
                <AttendeeDashboard />
              </Guard>
            }
          />
          <Route
            path="/check-in"
            element={
              <Guard
                requireAuth
                roles={["Admin", "Event Manager", "Volunteer"]}
              >
                <CheckIn />
              </Guard>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
