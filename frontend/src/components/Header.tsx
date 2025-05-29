import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";
import "../index.css"

const Header = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate("/catalog")}>
        🌸 FlowersLife
      </div>
      
      <nav className={styles.nav}>
      <button
        className={styles["theme-toggle"]}
        onClick={() => {
          const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
          document.body.dataset.theme = newTheme;
          localStorage.setItem("theme", newTheme);
        }}
      >
        🌓 Сменить тему
      </button>
        {token && <Link to="/favorites">Избранное</Link>}
        {token && <Link to="/cart">Корзина</Link>}
        {token && <Link to="/orders">Заказы</Link>}
        {token && <Link to="/profile">Профиль</Link>}
        {token ? (
          <button className={styles["logout-btn"]} onClick={handleLogout}>
            Выйти
          </button>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
