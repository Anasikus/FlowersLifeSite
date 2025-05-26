import { useEffect, useState } from "react";
import Header from "../../components/Header";

interface CartItem {
  idBasket: number;
  idProducts: number;
  name: string;
  cost: number;
  image: string;
  count: number;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка загрузки корзины", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleDelete = async (productId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCart((prev) => prev.filter((item) => item.idProducts !== productId));
      } else {
        alert("Ошибка удаления");
      }
    } catch (err) {
      console.error("Ошибка удаления", err);
    }
  };

  const updateCount = async (productId: number, newCount: number) => {
    if (newCount < 1) return;

    try {
      const res = await fetch(`http://localhost:4000/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: newCount }),
      });

      if (res.ok) {
        setCart((prev) =>
          prev.map((item) =>
            item.idProducts === productId ? { ...item, count: newCount } : item
          )
        );
      } else {
        const error = await res.json();
        alert(error.message || "Ошибка обновления количества");
      }
    } catch (err) {
      console.error("Ошибка изменения количества", err);
    }
  };

  const handleOrder = async () => {
    try {
      const res = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Заказ успешно оформлен!");
        setCart([]);
      } else {
        alert(data.message || "Ошибка оформления заказа");
      }
    } catch (err) {
      console.error("Ошибка при заказе", err);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.cost * item.count, 0);

  if (loading)
    return (
      <>
        <Header />
        <p style={{ padding: "2rem", textAlign: "center" }}>Загрузка корзины...</p>
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
        <h2 style={{ color: "#d63384", marginBottom: "1.5rem" }}>🛒 Ваша корзина</h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>Корзина пуста</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cart.map((item) => (
                <li
                  key={item.idBasket}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                    backgroundColor: "#fff",
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", flex: 1, alignItems: "center" }}>
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                      }}
                    />
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong>
                      <div style={{ marginTop: "0.5rem", display: "flex" }}>
                        <button
                          onClick={() => updateCount(item.idProducts, item.count - 1)}
                          style={buttonStyle}
                        >
                          −
                        </button>
                        <span>{item.count}</span>
                        <button
                          onClick={() => updateCount(item.idProducts, item.count + 1)}
                          style={buttonStyle}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ marginTop: "0.5rem", color: "#555" }}>
                        {item.cost}₽ × {item.count} = <strong>{item.cost * item.count}₽</strong>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.idProducts)} style={deleteStyle}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop: "2rem", color: "#111" }}>Итого: {total}₽</h3>

            <button onClick={handleOrder} style={orderButtonStyle}>
              Оформить заказ
            </button>
          </>
        )}
      </div>
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "0.2rem 0.5rem",
  margin: "0 0.5rem",
  borderRadius: "4px",
  backgroundColor: "#eee",
  cursor: "pointer",
};

const deleteStyle: React.CSSProperties = {
  backgroundColor: "#ff6b6b",
  color: "#fff",
  border: "none",
  padding: "0.4rem 0.6rem",
  fontSize: "0.9rem",
  borderRadius: "4px",
  cursor: "pointer",
  height: "fit-content",
};

const orderButtonStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  padding: "0.75rem 1.5rem",
  fontSize: "16px",
  backgroundColor: "#d63384",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Cart;
