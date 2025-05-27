import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";
import type { User } from "../../types/User";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.error("Ответ сервера не является массивом:", res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Ошибка при получении пользователей", err);
      setUsers([]);
    }
  };

  const changeRole = async (id: number, role: string) => {
    try {
      await axios.put(
        `/admin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Ошибка при смене роли", err);
    }
  };

  const toggleBlock = async (id: number, isBlocked: boolean) => {
    try {
      await axios.put(
        `/admin/users/${id}/block`,
        { isBlocked: !isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Ошибка при блокировке/разблокировке", err);
    }
  };

  return (
    <div>
      <AdminHeader />
      <h1>Пользователи</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Телефон</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Роль</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Изменить роль</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Статус</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Блокировка</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.id}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.username}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{u.role}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                >
                  <option value="user">Пользователь</option>
                  <option value="employee">Сотрудник</option>
                  <option value="admin">Админ</option>
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.is_blocked ? "Заблокирован" : "Активен"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <button onClick={() => toggleBlock(u.id, u.is_blocked)}>
                  {u.is_blocked ? "Разблокировать" : "Заблокировать"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
