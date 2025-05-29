import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";
import type { User } from "../../types/User";

import styles from "../../styles/UsersPage.module.css";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFiltered(
      users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    }
  };

  const changeRole = async (id: number, role: string) => {
    await axios.put(
      `/admin/users/${id}/role`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const toggleBlock = async (id: number, isBlocked: boolean) => {
    await axios.put(
      `/admin/users/${id}/block`,
      { isBlocked: !isBlocked },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  return (
    <div className={styles.container}>
      <AdminHeader />
      <h1 className={styles.title}>Пользователи</h1>

      <input
        type="text"
        placeholder="Поиск по телефону..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Телефон</th>
              <th className={styles.th}>Роль</th>
              <th className={styles.th}>Изменить роль</th>
              <th className={styles.th}>Статус</th>
              <th className={styles.th}>Блокировка</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className={styles.tableRow}>
                <td className={styles.td}>{u.id}</td>
                <td className={styles.td}>{u.username}</td>
                <td className={styles.td}>{u.role}</td>
                <td className={styles.td}>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className={styles.select}
                  >
                    <option value="user">Пользователь</option>
                    <option value="employee">Сотрудник</option>
                    <option value="admin">Админ</option>
                  </select>
                </td>
                <td className={styles.td}>
                  {u.is_blocked ? "Заблокирован" : "Активен"}
                </td>
                <td className={styles.td}>
                  <button
                    onClick={() => toggleBlock(u.id, u.is_blocked)}
                    className={
                      u.is_blocked ? styles.unblockButton : styles.blockButton
                    }
                  >
                    {u.is_blocked ? "Разблокировать" : "Заблокировать"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
