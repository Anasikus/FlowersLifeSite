import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // предполагаем, что тут хранится роль

const AdminHeader = () => {
  const { role } = useAuth();

  return (
    <nav style={{ padding: "1rem", backgroundColor: "#222", color: "#fff", display: "flex", gap: "1rem" }}>
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

      {/* Показываем эти пункты только для админов */}
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
    </nav>
  );
};

export default AdminHeader;
