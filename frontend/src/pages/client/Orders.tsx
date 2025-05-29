import { useEffect, useState } from 'react';
import Header from '../../components/Header';

interface OrderProduct {
  idProducts: number;
  nameProducts: string;
  count: number;
  cost: number;
  photo: string;
}

interface Order {
  id: number;
  dateCreate: string;
  status: string;
  products: OrderProduct[];
  total: number;
}

interface Review {
  rating: number;
  text: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<OrderProduct | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState<Record<number, Review>>({}); // храним отзывы по idProduct

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:4000/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
        } else {
          console.error('Ошибка загрузки заказов:', data.message);
        }
      } catch (error) {
        console.error('Ошибка запроса:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Получаем отзывы пользователя по товарам (можно реализовать отдельный эндпоинт для отзывов)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:4000/reviews/my", { // предположим такой эндпоинт
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // data должен быть массивом отзывов с полями idProduct, rating, text
          const revs: Record<number, Review> = {};
          data.forEach((r: any) => {
            revs[r.idProduct] = { rating: r.rating, text: r.text };
          });
          setReviews(revs);
        }
      } catch (err) {
        console.error("Ошибка загрузки отзывов:", err);
      }
    };
    fetchReviews();
  }, [token]);

  const repeatOrder = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/orders/${orderId}/repeat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert("🛒 Товары из заказа добавлены в корзину");
      } else {
        alert(data.message || "Ошибка при повторении заказа");
      }
    } catch (err) {
      console.error("Ошибка повторения заказа:", err);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert("🚫 Заказ отменён");
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "Отменён" } : order
          )
        );
      } else {
        alert(data.message || "Ошибка при отмене заказа");
      }
    } catch (err) {
      console.error("Ошибка отмены заказа:", err);
    }
  };

  const openReviewModal = (product: OrderProduct) => {
    setSelectedProduct(product);

    // Если есть сохранённый отзыв, подставляем его в форму
    if (reviews[product.idProducts]) {
      setRating(reviews[product.idProducts].rating);
      setText(reviews[product.idProducts].text);
    } else {
      setRating(0);
      setText('');
    }

    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
    setRating(0);
    setText('');
  };

  const submitReview = async () => {
    if (!selectedProduct || rating === 0) {
      alert("Пожалуйста, выберите оценку и напишите отзыв");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idProduct: selectedProduct.idProducts,
          rating,
          text,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Спасибо за отзыв!");

        // Обновляем локальные отзывы для кнопки и формы
        setReviews((prev) => ({
          ...prev,
          [selectedProduct.idProducts]: { rating, text }
        }));

        closeReviewModal();
      } else {
        alert(data.message || "Ошибка при добавлении отзыва");
      }
    } catch (err) {
      console.error("Ошибка отправки отзыва:", err);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>📦 Мои заказы</h2>
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : orders.length === 0 ? (
          <p>У вас пока нет заказов.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                style={{
                  marginBottom: '2rem',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '1rem',
                }}
              >
                <h3>🧾 Заказ №{order.id} - {order.status}</h3>
                <p><strong>Дата оформления:</strong> {new Date(order.dateCreate).toLocaleString()}</p>

                <div style={{ marginTop: '1rem' }}>
                  <h4>Товары в заказе:</h4>
                  {order.products.map((product) => (
                    <div
                      key={product.idProducts}
                      style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
                    >
                      <img
                        src={product.photo ? `http://localhost:4000/${product.photo}` : "/placeholder.png"}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          marginRight: '1rem',
                        }}
                      />
                      <div>
                        <p><strong>{product.nameProducts}</strong></p>
                        <p>Цена: {product.cost} ₽</p>
                        <p>Количество: {product.count}</p>
                      </div>
                    </div>
                  ))}
                  <p><strong>Итоговая сумма:</strong> {order.total.toFixed(2)} ₽</p>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => repeatOrder(order.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🔁 Повторить заказ
                  </button>

                  {order.status !== "Отменён" && order.status !== "Выдан" && order.status !== "Отказано" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ❌ Отменить заказ
                    </button>
                  )}

                  {order.status === "Выдан" &&
                    order.products.map((product) => (
                      <button
                        key={product.idProducts}
                        onClick={() => openReviewModal(product)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#0d6efd",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        {reviews[product.idProducts] ? "✏️ Изменить отзыв" : "📝 Оставить отзыв"} о {product.nameProducts}
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showReviewModal && selectedProduct && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000
        }}>
          <div className="modal-content">
            <h3>📝 Отзыв о {selectedProduct.nameProducts}</h3>

            <label>Оценка:</label>
            <div style={{ display: "flex", gap: "0.25rem", margin: "0.5rem 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    cursor: "pointer",
                    color: rating >= star ? "gold" : "#ccc",
                    fontSize: "1.5rem"
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Комментарий (необязательно)"
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={submitReview} style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}>
                Отправить
              </button>
              <button onClick={closeReviewModal} style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
