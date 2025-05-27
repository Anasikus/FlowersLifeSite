import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminHeader = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // очищает токен/контекст
    navigate("/login"); // перенаправление на страницу входа
  };

  return (
    <nav
      style={{
        padding: "1rem",
        backgroundColor: "#222",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      {/* Левая часть — навигация */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <NavLink
          to="/admin/orders"
          style={({ isActive }) => ({
            color: isActive ? "#0d6efd" : "#fff",
            textDecoration: "none",
            fontWeight: "bold"
          })}
        >
          Заказы
        </NavLink>

        {role === "admin" && (
          <>
            <NavLink
              to="/admin/users"
              style={({ isActive }) => ({
                color: isActive ? "#0d6efd" : "#fff",
                textDecoration: "none",
                fontWeight: "bold"
              })}
            >
              Пользователи
            </NavLink>
            <NavLink
              to="/admin/addresses"
              style={({ isActive }) => ({
                color: isActive ? "#0d6efd" : "#fff",
                textDecoration: "none",
                fontWeight: "bold"
              })}
            >
              Адреса
            </NavLink>
          </>
        )}

        <NavLink
          to="/admin/categories"
          style={({ isActive }) => ({
            color: isActive ? "#0d6efd" : "#fff",
            textDecoration: "none",
            fontWeight: "bold"
          })}
        >
          Категории
        </NavLink>

        <NavLink
          to="/admin/analytics"
          style={({ isActive }) => ({
            color: isActive ? "#0d6efd" : "#fff",
            textDecoration: "none",
            fontWeight: "bold"
          })}
        >
          Аналитика
        </NavLink>
      </div>

      {/* Правая часть — имя пользователя и выход */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>{user?.username || "Неизвестный пользователь"}</span>
        <button onClick={handleLogout} style={{ backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}>
          Выйти
        </button>
      </div>
    </nav>
  );
};

export default AdminHeader;
