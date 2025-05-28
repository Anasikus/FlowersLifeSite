import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";

interface Product {
  idProducts: number;
  nameProducts: string;
  cost: string;
  count: string;
  codeCategory: string;
  photo: string;
}

interface ProductForm {
  nameProducts: string;
  cost: string;
  count: string;
  codeCategory: string;
  photo: File | null;
}

interface Category {
  codeCategory: string;
  title: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>({
    nameProducts: "",
    cost: "",
    count: "",
    codeCategory: "",
    photo: null,
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const getCategoryTitle = (code: string) => {
    const category = categories.find((cat) => cat.codeCategory === code);
    return category ? category.title : "Неизвестно";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm((prev) => ({
        ...prev,
        photo: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nameProducts", form.nameProducts);
    formData.append("cost", form.cost);
    formData.append("count", form.count);
    formData.append("codeCategory", form.codeCategory);
    if (form.photo) {
      formData.append("photo", form.photo);
    }

    try {
      const token = localStorage.getItem("token");
      if (isEditing && editProductId !== null) {
        await axios.put(`http://localhost:4000/admin/products/${editProductId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post("http://localhost:4000/admin/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchProducts();
      setForm({
        nameProducts: "",
        cost: "",
        count: "",
        codeCategory: "",
        photo: null,
      });
      setShowModal(false);
      setIsEditing(false);
      setEditProductId(null);
    } catch (error) {
      console.error("Ошибка при сохранении товара:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      nameProducts: product.nameProducts,
      cost: product.cost,
      count: product.count,
      codeCategory: product.codeCategory,
      photo: null,
    });
    setEditProductId(product.idProducts);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:4000/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const filteredProducts = products.filter((product) =>
    product.nameProducts.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <AdminHeader />
      <h2 className="text-xl font-bold mb-4">Управление товарами</h2>

      <input
        type="text"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border w-full"
      />

      <button
        onClick={() => {
          setForm({ nameProducts: "", cost: "", count: "", codeCategory: "", photo: null });
          setIsEditing(false);
          setEditProductId(null);
          setShowModal(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 mb-4"
      >
        Добавить товар
      </button>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? "Редактировать товар" : "Добавить товар"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input name="nameProducts" placeholder="Название" value={form.nameProducts} onChange={handleChange} className="border p-2 w-full" />
              <input name="cost" placeholder="Цена" value={form.cost} onChange={handleChange} className="border p-2 w-full" />
              <input name="count" placeholder="Количество" value={form.count} onChange={handleChange} className="border p-2 w-full" />
              <select
                name="codeCategory"
                value={form.codeCategory}
                onChange={handleChange}
                className="border p-2 w-full"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.codeCategory} value={category.codeCategory}>
                    {category.title}
                  </option>
                ))}
              </select>

              <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 w-full" />

              <div className="flex justify-between">
                <button type="submit" className="bg-green-500 text-white px-4 py-2">
                  {isEditing ? "Сохранить изменения" : "Добавить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-4 py-2"
                >
                  Закрыть
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.idProducts} className="border p-4 rounded shadow">
            <img
              src={product.photo ? `http://localhost:4000/${product.photo}` : "/placeholder.png"}
              style={{ width: '200px', height: '200px', objectFit: 'cover', marginRight: '1rem' }}
            />
            <h3 className="text-lg font-bold">{product.nameProducts}</h3>
            <p>Цена: {product.cost} ₽</p>
            <p>Количество: {product.count}</p>
            <p>Категория: {getCategoryTitle(product.codeCategory)}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-4 py-1"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(product.idProducts)}
                className="bg-red-500 text-white px-4 py-1"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;
