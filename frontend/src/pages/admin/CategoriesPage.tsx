import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "../../components/AdminHeader";

type Category = {
  codeCategory: number;
  title: string;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addCategoryName, setAddCategoryName] = useState("");

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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.title);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      await axios.put(
        `/admin/categories/${editingCategory.codeCategory}`,
        { nameCategory: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCategory(null);
      setNewCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error("Ошибка обновления категории", err);
    }
  };

  const handleAddCategory = async () => {
    if (!addCategoryName.trim()) return;

    try {
      await axios.post(
        "/admin/categories",
        { nameCategory: addCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error("Ошибка добавления категории", err);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) =>
        cat.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      <AdminHeader />
      <h1>Категории товаров</h1>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Поиск категории..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button onClick={handleClearSearch}>Очистить поиск</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Название категории</th>
            <th>Редактировать</th>
            <th>Удалить</th>
            <th>Товары категории</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((cat) => (
            <tr key={cat.codeCategory}>
              <td>{cat.title}</td>
              <td>
                <button onClick={() => handleEdit(cat)}>Редактировать</button>
              </td>
              <td>
                <button onClick={() => handleDelete(cat.codeCategory)}>
                  Удалить
                </button>
              </td>
              <td>
                <button
                  onClick={() =>
                    alert(`Перейти к товарам категории #${cat.codeCategory}`)
                  }
                >
                  Товары
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Добавление категории */}
      <div style={{ marginTop: "30px" }}>
        <h3>Добавить новую категорию</h3>
        <input
          type="text"
          placeholder="Название категории"
          value={addCategoryName}
          onChange={(e) => setAddCategoryName(e.target.value)}
        />
        <button onClick={handleAddCategory}>Добавить</button>
      </div>

      {/* Редактирование категории */}
      {editingCategory && (
        <div style={{ marginTop: "30px" }}>
          <h3>Редактировать категорию</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button onClick={handleUpdate}>Сохранить</button>
          <button onClick={() => setEditingCategory(null)}>Отмена</button>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
