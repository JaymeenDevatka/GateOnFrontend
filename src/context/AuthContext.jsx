import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email } - single user can act as both organizer and attendee

  const login = (email, password, name = null) => {
    // In real app, this would validate credentials with backend
    // Single user can access both organizer and attendee features
    setUser({
      id: 'user-1',
      name: name || email.split('@')[0], // Use provided name or email prefix as name for demo
      email
    });
  };

  const loginAs = (role) => {
    // Legacy function for demo purposes - still creates a single user
    setUser({
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@gateon.com'
    });
  };

  const logout = () => setUser(null);

  const isAuthenticated = () => user !== null;

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

