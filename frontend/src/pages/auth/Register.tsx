import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputPhoneMask, { getCleanPhone } from "../../components/InputPhoneMask";
import styles from "./AuthForm.module.css";
import Header from "../../components/Header";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    surname: "",
    name: "",
    patronymic: "",
    birthdate: "",
    mail: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return (
      age > 18 || (age === 18 && m >= 0)
    ) && age <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = getCleanPhone(form.username);

    if (!isValidAge(form.birthdate)) {
      alert("Возраст должен быть от 18 до 100 лет");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, username: phone }),
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
    <>
      <Header />
      <form onSubmit={handleSubmit} className={styles.container}>
        <h2>Регистрация</h2>

        <input
          type="text"
          placeholder="Фамилия"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Отчество (необязательно)"
          value={form.patronymic}
          onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
        />
        <input
          type="date"
          placeholder="Дата рождения"
          value={form.birthdate}
          onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Почта (необязательно)"
          value={form.mail}
          onChange={(e) => setForm({ ...form, mail: e.target.value })}
        />

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
    </>
  );
};

export default Register;
