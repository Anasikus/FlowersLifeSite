import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputPhoneMask, { getCleanPhone } from "../../components/InputPhoneMask";
import styles from "./AuthForm.module.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = getCleanPhone(form.username);

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: phone, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Ошибка регистрации");
        return;
      }

      const loginRes = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: phone, password: form.password }),
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        login(loginData.token);
        navigate("/");
      } else {
        alert("Зарегистрировались, но не удалось войти.");
      }
    } catch (err) {
      console.error("Ошибка при регистрации:", err);
      alert("Ошибка сервера");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2>Регистрация</h2>

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

      <button type="submit">Зарегистрироваться</button>
    </form>
  );
};

export default Register;
