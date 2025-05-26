import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  token: string;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  token: "",
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setRole(decoded.role);
        localStorage.setItem("token", token);
      } catch (err) {
        console.warn("Неверный токен. Удаляю...");
        setToken("");
        setRole(null);
        localStorage.removeItem("token");
      }
    } else {
      setRole(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken("");
    setRole(null);
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token && !!role;

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
