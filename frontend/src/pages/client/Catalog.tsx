import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/Header";

type Category = {
  codeCategory: number;
  title: string;
  photo: string;
};

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // состояние боковой панели

  useEffect(() => {
    fetch("http://localhost:4000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Ошибка загрузки категорий:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = new URL("http://localhost:4000/products");

    if (query.trim()) {
      url.searchParams.append("search", query);
    }

    if (selectedCategory !== null) {
      url.searchParams.append("category", selectedCategory.toString());
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки товаров:", err);
        setLoading(false);
      });
  }, [query, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleCategoryClick = (code: number | null) => {
    setSelectedCategory(code);
    setIsSidebarOpen(false); // Закрыть боковую панель
  };

  return (
    <>
      <Header />
      <div
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "1.5rem" }}>Каталог товаров</h2>

        {/* Поиск */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1.5rem", display: "flex" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            style={{
              padding: "0.5rem",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              flex: 1,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              marginLeft: "0.5rem",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              width: "150px",
            }}
          >
            Найти
          </button>
        </form>
        {/* Кнопка "Фильтры" */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Фильтры
        </button>
        {/* Боковая панель */}
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: isSidebarOpen ? 0 : "-300px",
            width: "300px",
            height: "100%",
            backgroundColor: "#f8f9fa",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
            padding: "1rem",
            transition: "left 0.3s ease-in-out",
            zIndex: 1000,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Категории</h3>
          <button
            onClick={() => handleCategoryClick(null)}
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              backgroundColor: selectedCategory === null ? "#007bff" : "#e0e0e0",
              color: selectedCategory === null ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Все категории
          </button>
          {categories.map((cat) => (
            <button
              key={cat.codeCategory}
              onClick={() => handleCategoryClick(cat.codeCategory)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                backgroundColor: selectedCategory === cat.codeCategory ? "#007bff" : "#e0e0e0",
                color: selectedCategory === cat.codeCategory ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {cat.title}
            </button>
          ))}
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Закрыть
          </button>
        </aside>

        {/* Товары */}
        {loading ? (
          <p style={{ textAlign: "center", fontSize: "18px" }}>Загрузка товаров...</p>
        ) : products.length === 0 ? (
          <p style={{ fontSize: "16px", opacity: 0.7 }}>Товары не найдены</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.idProducts} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Catalog;
