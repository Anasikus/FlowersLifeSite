import { useEffect, useState } from "react";
import Header from "../../components/Header";
import styles from "../../styles/CardList.module.css";

interface CartItem {
  idBasket: number;
  idProducts: number;
  name: string;
  cost: number;
  image: string;
  count: number;
  availableStock: number; // Теперь приходит с сервера
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
    const item = cart.find((i) => i.idProducts === productId);
    if (!item) return;
    if (newCount < 1 || newCount > item.availableStock) return;

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
          prev.map((i) =>
            i.idProducts === productId ? { ...i, count: newCount } : i
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
      <div className={styles.container}>
        <h2 className={styles.title}>🛒 Ваша корзина</h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>Корзина пуста</p>
        ) : (
          <>
            <ul className={styles.cardList}>
              {cart.map((item) => {
                const isMaxCount = item.count >= item.availableStock;
                return (
                  <li className={styles.cardItem}
                    key={item.idBasket}
                  >
                    <div style={{ display: "flex", gap: "1rem", flex: 1, alignItems: "center" }}>
                      <img className={styles.cardImage}
                        src={item.image ? `http://localhost:4000/${item.image}` : "/placeholder.png"}
                        alt={item.name}
                      />
                      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong>
                        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center" }}>
                          <button
                            onClick={() => updateCount(item.idProducts, item.count - 1)}
                            style={buttonStyle}
                          >
                            −
                          </button>
                          <span>{item.count}</span>
                          <button
                            onClick={() => updateCount(item.idProducts, item.count + 1)}
                            style={{
                              ...buttonStyle,
                              opacity: isMaxCount ? 0.5 : 1,
                              cursor: isMaxCount ? "not-allowed" : "pointer",
                            }}
                            disabled={isMaxCount}
                          >
                            +
                          </button>
                        </div>
                        {isMaxCount && (
                          <div style={{ color: "red", fontSize: "0.9rem" }}>
                            Больше нет в наличии ({item.availableStock} шт.)
                          </div>
                        )}
                        <div style={{ marginTop: "0.5rem", color: "#555" }}>
                          {item.cost}₽ × {item.count} ={" "}
                          <strong>{item.cost * item.count}₽</strong>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.idProducts)} style={deleteStyle}>
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>

            <h3 className="text">Итого: {total}₽</h3>

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
  width: "40px"
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
