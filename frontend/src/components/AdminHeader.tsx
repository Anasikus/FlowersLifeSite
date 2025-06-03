import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import FeedbackModal from "./FeedbackModal";

const AdminHeader = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <nav
        style={{
          padding: "1rem",
          backgroundColor: theme === "dark" ? "#222" : "#f8f9fa",
          color: theme === "dark" ? "#fff" : "#000",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {/* Левая часть — навигация */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            { to: "/admin/orders", label: "Заказы" },
            { to: "/admin/products", label: "Товары" },
            { to: "/admin/categories", label: "Категории" },
            ...(role === "admin"
              ? [
                  { to: "/admin/users", label: "Пользователи" },
                  { to: "/admin/addresses", label: "Адреса" },
                  { to: "/admin/feedback", label: "Обращения"}
                ]
              : []),
            { to: "/admin/stats", label: "Аналитика" }
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive
                  ? "#0d6efd"
                  : theme === "dark"
                  ? "#fff"
                  : "#000",
                textDecoration: "none",
                fontWeight: "bold"
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Правая часть — имя пользователя, тема и выход */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>{user?.username || "Неизвестный пользователь"}</span>

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: theme === "dark" ? "#0d6efd" : "#6c757d",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "5px"
            }}
          >
            Выйти
          </button>
        </div>
      </nav>

      {/* Рендер модального окна обратной связи */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
        />
      )}

    </>
  );
};

export default AdminHeader;
