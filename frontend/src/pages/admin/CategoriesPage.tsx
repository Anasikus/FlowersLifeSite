import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

type Category = {
  idCategory: number;
  nameCategory: string;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

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
      await axios.delete(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("Ошибка удаления категории", err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.nameCategory);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      await axios.put(
        `/api/admin/categories/${editingCategory.idCategory}`,
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

  const filteredCategories = Array.isArray(categories)
  ? categories.filter(cat => cat.nameCategory.toLowerCase().includes(search.toLowerCase()))
  : [];


  return (
    <div>
      <h1>Категории товаров</h1>

      <input
        type="text"
        placeholder="Поиск категории..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px" }}
      />

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
            <tr key={cat.idCategory}>
              <td>{cat.nameCategory}</td>
              <td>
                <button onClick={() => handleEdit(cat)}>Редактировать</button>
              </td>
              <td>
                <button onClick={() => handleDelete(cat.idCategory)}>Удалить</button>
              </td>
              <td>
                <button onClick={() => alert(`Перейти к товарам категории #${cat.idCategory}`)}>
                  Товары
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingCategory && (
        <div style={{ marginTop: "20px" }}>
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
