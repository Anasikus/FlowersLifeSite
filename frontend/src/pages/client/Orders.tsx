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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:4000/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, []);
  const token = localStorage.getItem("token");

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
      // Обновляем список заказов
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
                        src={`/${product.photo}`}
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
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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
                {order.status !== "Отменён" && (
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
              </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Orders;
