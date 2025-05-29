import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";
import styles from "../../styles/AdminAddressesPage.module.css";

type Address = {
  idAddress: number;
  name: string;
};

const AdminAddressesPage = () => {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [filtered, setFiltered] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [editing, setEditing] = useState<Address | null>(null);
  const [editedName, setEditedName] = useState("");
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    setFiltered(
      addresses.filter((addr) =>
        addr.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, addresses]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/admin/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data);
    } catch (err) {
      console.error("Ошибка получения адресов", err);
    }
  };

  const handleAdd = async () => {
    if (!newAddress.trim()) return;
    try {
      await axios.post(
        "/admin/addresses",
        { name: newAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAddress("");
      setIsAddModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error("Ошибка добавления адреса", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить адрес?")) return;
    try {
      await axios.delete(`/admin/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (err) {
      console.error("Ошибка удаления адреса", err);
    }
  };

  const handleEdit = (address: Address) => {
    setEditing(address);
    setEditedName(address.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await axios.put(
        `/admin/addresses/${editing.idAddress}`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(null);
      setEditedName("");
      setIsEditModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error("Ошибка обновления адреса", err);
    }
  };

  return (
    <div className={styles.container}>
      <AdminHeader />
      <h2 className={styles.title}>Адреса магазинов</h2>

      <div className={styles.searchAddContainer}>
        <input
          type="text"
          placeholder="Поиск адреса..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addButton}
        >
          Добавить адрес
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Адрес</th>
            <th className={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((addr) => (
            <tr key={addr.idAddress}>
              <td className={styles.td}>{addr.name}</td>
              <td className={styles.td}>
                <button
                  onClick={() => handleEdit(addr)}
                  className={`${styles.actionButton} ${styles.editButton}`}
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(addr.idAddress)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка добавления */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Добавить адрес</h3>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Введите адрес"
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleAdd} className={styles.saveButton}>
                Сохранить
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования */}
      {isEditModalOpen && editing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Редактировать адрес</h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleUpdate} className={styles.saveButton}>
                Сохранить
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddressesPage;
