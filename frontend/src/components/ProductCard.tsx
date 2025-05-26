import { useEffect, useState } from "react";

interface Product {
  idProducts: number;
  nameProducts: string;
  descriptionProducts: string;
  cost: number;
  photo: string;
  codeCategory: number;
  quantity: number;
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const token = localStorage.getItem("token");
  const [isFavorite, setIsFavorite] = useState(false);

  const checkIfFavorite = async () => {
    try {
      const res = await fetch("http://localhost:4000/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const favoriteIds = data.map((item: Product) => item.idProducts);
      setIsFavorite(favoriteIds.includes(product.idProducts));
    } catch (err) {
      console.error("Ошибка при проверке избранного", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await fetch(`http://localhost:4000/favorites/${product.idProducts}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        await fetch("http://localhost:4000/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.idProducts }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Ошибка при добавлении/удалении", err);
    }
  };

  const handleAddToCart = async () => {
    try {
      const res = await fetch("http://localhost:4000/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.idProducts, count: 1 }),
      });

      if (res.ok) {
        alert("✅ Товар добавлен в корзину!");
      } else {
        const data = await res.json();
        alert(data.message || "Ошибка добавления в корзину");
      }
    } catch (err) {
      console.error("Ошибка при добавлении в корзину", err);
    }
  };


  useEffect(() => {
    checkIfFavorite();
  }, []);

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      <img
        src={product.photo || "/placeholder.jpg"}
        alt={product.nameProducts}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          borderRadius: "6px",
        }}
      />
      <h3>{product.nameProducts}</h3>
      <p style={{ fontSize: "14px", color: product.quantity > 0 ? "green" : "red" }}>
          В наличии: {product.quantity}
      </p>

      <p>{product.cost}₽</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          onClick={toggleFavorite}
          style={{
            backgroundColor: isFavorite ? "#ffc107" : "#eee",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isFavorite ? "★ В избранном" : "☆ В избранное"}
        </button>

        <button
          onClick={handleAddToCart}
          style={{
            marginTop: "0.5rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🛒 Добавить в корзину
        </button>

      </div>
    </div>
  );
};

export default ProductCard;
