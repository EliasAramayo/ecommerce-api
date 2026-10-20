import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const u = JSON.parse(savedUser);

      const normalizedUser = {
        id: u.id || u.Id,
        username: u.username || u.Username,
        email: u.email || u.Email,
        role: u.role || u.Role
      };

      setAuth({
        isAuthenticated: true,
        token,
        user: normalizedUser
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
