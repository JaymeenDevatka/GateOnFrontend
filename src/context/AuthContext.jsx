import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "eventhive.auth.v1";

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY), null),
  );
  const [role, setRole] = useState(() =>
    safeJsonParse(localStorage.getItem(`${STORAGE_KEY}.role`), "Admin"),
  );

  const login = (email, password, name = null) => {
    // In real app, this would validate credentials with backend
    // Single user can access both organizer and attendee features
    setUser({
      id: "user-1",
      name: name || email.split("@")[0], // Use provided name or email prefix as name for demo
      email,
    });
    setRole((prev) => prev || "Admin");
  };

  const loginAs = (role) => {
    // Legacy function for demo purposes - still creates a single user
    setUser({
      id: "user-1",
      name: "Demo User",
      email: "demo@gateon.com",
    });
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (role) {
      localStorage.setItem(`${STORAGE_KEY}.role`, JSON.stringify(role));
    }
  }, [role]);

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (!allowedRoles || !allowedRoles.length) return true;
    return allowedRoles.includes(role);
  };

  const value = useMemo(
    () => ({
      user,
      role,
      setRole,
      login,
      loginAs,
      logout,
      isAuthenticated,
      hasRole,
    }),
    [user, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
