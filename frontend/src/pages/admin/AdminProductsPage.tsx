import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import styles from "../../styles/AdminProductsPage.module.css";

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
    <div className={styles.page}>
      <AdminHeader />
      <h2 className={styles.title}>Управление товарами</h2>

      <input
        type="text"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <button
        onClick={() => {
          setForm({ nameProducts: "", cost: "", count: "", codeCategory: "", photo: null });
          setIsEditing(false);
          setEditProductId(null);
          setShowModal(true);
        }}
        className={styles.addButton}
      >
        Добавить товар
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {isEditing ? "Редактировать товар" : "Добавить товар"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  name="nameProducts"
                  placeholder="Название"
                  value={form.nameProducts}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Цена"
                  value={form.cost}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  name="count"
                  type="number"
                  min="0"
                  placeholder="Количество"
                  value={form.count}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <select
                  name="codeCategory"
                  value={form.codeCategory}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.codeCategory} value={category.codeCategory}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.formFile}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {isEditing ? "Сохранить изменения" : "Добавить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.closeButton}
                >
                  Закрыть
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <div key={product.idProducts} className={styles.productCard}>
            <img
              src={product.photo ? `http://localhost:4000/${product.photo}` : "/placeholder.png"}
              alt={product.nameProducts}
              className={styles.productImage}
            />
            <h3 className={styles.productName}>{product.nameProducts}</h3>
            <p className={styles.productInfo}>Цена: {product.cost} ₽</p>
            <p className={styles.productInfo}>Количество: {product.count}</p>
            <p className={styles.productInfo}>Категория: {getCategoryTitle(product.codeCategory)}</p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => handleEdit(product)}
                className={styles.editButton}
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(product.idProducts)}
                className={styles.deleteButton}
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
