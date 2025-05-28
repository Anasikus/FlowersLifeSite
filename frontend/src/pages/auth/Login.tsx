import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputPhoneMask, { getCleanPhone } from "../../components/InputPhoneMask";
import styles from "./AuthForm.module.css";
import Header from "../../components/Header";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = getCleanPhone(form.username);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: phone, password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate("/");
      } else {
        alert(data.message || "Ошибка входа");
      }
    } catch (err) {
      console.error("Ошибка входа:", err);
      alert("Ошибка сервера");
    }
  };

  return (
    <>    
    <Header />
    <form onSubmit={handleSubmit} className={styles.container}>
      
      <h2>Вход</h2>

      <InputPhoneMask
        value={form.username}
        onChange={(val) => setForm({ ...form, username: val })}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      <button type="submit">Войти</button>

      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
    </>

  );
};

export default Login;