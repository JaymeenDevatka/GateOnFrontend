import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, signupApi } from "../services/api";


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
  const [role, setRole] = useState(() => {
    const u = safeJsonParse(localStorage.getItem(STORAGE_KEY), null);
    return u?.role ?? safeJsonParse(localStorage.getItem(`${STORAGE_KEY}.role`), "Attendee");
  });

  const setUserFromApi = (apiUser) => {
    if (!apiUser) {
      setUser(null);
      setRole("Attendee");
      return;
    }
    const u = {
      id: apiUser.id,
      name: apiUser.name ?? apiUser.email?.split("@")[0],
      email: apiUser.email,
      role: apiUser.role ?? "Attendee",
    };
    setUser(u);
    setRole(u.role);
  };

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    setUserFromApi(data.user);
  };

  const signup = async (name, email, password) => {
    const data = await signupApi({ name, email, password });
    setUserFromApi(data.user);
  };

  const loginAs = (r) => {
    setUser({
      id: "user-1",
      name: "Demo User",
      email: "demo@gateon.com",
      role: "EventManager",
    });
    setRole(r || "EventManager");
  };

  const logout = () => {
    setUser(null);
    setRole("Attendee");
  };

  const isAuthenticated = () => user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (user.role) setRole(user.role);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role) {
      localStorage.setItem(`${STORAGE_KEY}.role`, JSON.stringify(user.role));
    }
  }, [role, user?.role]);

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    const r = user.role ?? role;
    if (!allowedRoles || !allowedRoles.length) return true;
    return allowedRoles.includes(r);
  };

  const value = useMemo(
    () => ({
      user,
      role,
      setRole,
      setUserFromApi,
      login,
      signup,
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
