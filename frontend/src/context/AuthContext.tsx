import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";

// Тип данных пользователя
interface User {
  username: string;
  // добавьте другие поля при необходимости
}

// Обновлённый тип контекста
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  token: string;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

// Инициализация контекста
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  token: "",
  user: null,
  login: () => {},
  logout: () => {},
});

// Хук
export const useAuth = () => useContext(AuthContext);

// Провайдер
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setRole(decoded.role);
        setUser({ username: decoded.username }); // Предполагаем, что username есть в токене
        localStorage.setItem("token", token);
      } catch (err) {
        console.warn("Неверный токен. Удаляю...");
        setToken("");
        setRole(null);
        setUser(null);
        localStorage.removeItem("token");
      }
    } else {
      setRole(null);
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken("");
    setRole(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token && !!role;

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
