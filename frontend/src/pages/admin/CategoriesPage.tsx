import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";
import "../../styles/CategoriesPage.module.css"
import "../../index.css"

// Типы

type Category = {
  codeCategory: number;
  title: string;
};

type CategoryModalProps = {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
  title: string;
};

// Модальное окно
const CategoryModal = ({ isOpen, initialName, onSave, onClose, title }: CategoryModalProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  if (!isOpen) return null;

  const isDark = document.body.getAttribute("data-theme") === "dark";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "10px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 10 }}>{title}</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
          }}
          autoFocus
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={() => onSave(name)}
            disabled={!name.trim()}
            style={{
              backgroundColor: "#0063eb",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#888",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalInitialName, setModalInitialName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Ошибка загрузки категорий", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить категорию?")) return;
    try {
      await axios.delete(`/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("Ошибка удаления категории", err);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setModalInitialName("");
    setModalTitle("Добавить категорию");
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalInitialName(category.title);
    setModalTitle("Редактировать категорию");
    setModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (!name.trim()) return;
    try {
      if (editingCategory) {
        await axios.put(
          `/admin/categories/${editingCategory.codeCategory}`,
          { nameCategory: name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "/admin/categories",
          { nameCategory: name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Ошибка сохранения категории", err);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(search.toLowerCase())
  );

  const isDark = document.body.getAttribute("data-theme") === "dark";

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <AdminHeader />
      <h1 style={{ marginBottom: "20px" }}>Категории товаров</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Поиск категории..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button onClick={handleClearSearch} style={{ padding: "10px", backgroundColor: "#0063eb", color: "white", border: "none", borderRadius: "5px", width: "20%" }}>
          Очистить поиск
        </button>
        <button onClick={openAddModal} style={{ padding: "10px", backgroundColor: "#0063eb", color: "white", border: "none", borderRadius: "5px", width: "20%" }}>
          Добавить категорию
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Название категории</th>
            <th style={{ padding: "10px" }}>Редактировать</th>
            <th style={{ padding: "10px" }}>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((cat) => (
            <tr key={cat.codeCategory} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "10px" }}>{cat.title}</td>
              <td style={{ padding: "10px" }}>
                <button onClick={() => openEditModal(cat)} style={{ backgroundColor: "#0063eb", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px" }}>Редактировать</button>
              </td>
              <td style={{ padding: "10px" }}>
                <button onClick={() => handleDelete(cat.codeCategory)} style={{ backgroundColor: "#d9534f", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px" }}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryModal
        isOpen={modalOpen}
        initialName={modalInitialName}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default CategoriesPage;
