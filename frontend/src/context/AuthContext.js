import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('dairy_user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dairy_token'));

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem('dairy_user', JSON.stringify(userData));
    localStorage.setItem('dairy_token', tok);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('dairy_user');
    localStorage.removeItem('dairy_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
