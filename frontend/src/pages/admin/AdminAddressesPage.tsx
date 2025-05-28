// AdminAddressesPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";

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
      fetchAddresses();
    } catch (err) {
      console.error("Ошибка обновления адреса", err);
    }
  };

  return (
    <div>
      <AdminHeader />
      <h2>Адреса магазинов</h2>

      <input
        type="text"
        placeholder="Поиск адреса..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      <div>
        <input
          type="text"
          placeholder="Новый адрес..."
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <button onClick={handleAdd}>Добавить</button>
      </div>

      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Адрес</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((addr) => (
            <tr key={addr.idAddress}>
              <td>{addr.name}</td>
              <td>
                <button onClick={() => handleEdit(addr)}>Редактировать</button>
                <button onClick={() => handleDelete(addr.idAddress)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Редактировать адрес</h3>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <button onClick={handleUpdate}>Сохранить</button>
          <button onClick={() => setEditing(null)}>Отмена</button>
        </div>
      )}
    </div>
  );
};

export default AdminAddressesPage;
