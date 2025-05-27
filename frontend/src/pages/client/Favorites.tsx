import { useEffect, useState } from "react";
import Header from "../../components/Header";

interface Product {
  idProducts: number;
  nameProducts: string;
  descriptionProducts: string;
  cost: number;
  photo: string;
  codeCategory: number;
  count: number; // Количество на складе
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка загрузки избранного", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/favorites/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((p) => p.idProducts !== productId));
      } else {
        alert("Ошибка при удалении из избранного");
      }
    } catch (err) {
      console.error("Ошибка удаления", err);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const res = await fetch("http://localhost:4000/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, count: 1 }),
      });

      if (res.ok) {
        alert("✅ Товар добавлен в корзину");
      } else {
        const error = await res.json();
        alert(error.message || "Ошибка добавления в корзину");
      }
    } catch (err) {
      console.error("Ошибка добавления в корзину", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <p style={{ padding: "2rem", textAlign: "center" }}>Загрузка избранного...</p>
      </>
    );

  return (
    <>
      <Header />
      <div
        style={{
          padding: "2rem",
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: "#0d6efd", marginBottom: "1.5rem" }}>⭐ Избранные товары</h2>

        {favorites.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>Список избранного пуст</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {favorites.map((item) => {
              const outOfStock = item.count === 0;

              return (
                <li
                  key={item.idProducts}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    backgroundColor: "#fff",
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <img
                      src={`/${item.photo}` || "/placeholder.jpg"}
                      alt={item.nameProducts}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                      }}
                    />
                    <div>
                      <strong>{item.nameProducts}</strong>
                      <div style={{ marginTop: "0.25rem", color: "#555" }}>{item.cost}₽</div>
                      <div style={{ fontSize: "0.85rem", color: outOfStock ? "red" : "green" }}>
                        {outOfStock ? "Нет в наличии" : `В наличии: ${item.count}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <button
                      onClick={() => addToCart(item.idProducts)}
                      disabled={outOfStock}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: outOfStock ? "#ccc" : "#0d6efd",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: outOfStock ? "not-allowed" : "pointer",
                      }}
                    >
                      {outOfStock ? "Нет в наличии" : "В корзину"}
                    </button>
                    <button
                      onClick={() => removeFavorite(item.idProducts)}
                      style={{
                        backgroundColor: "#ff6b6b",
                        color: "#fff",
                        border: "none",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

export default Favorites;
