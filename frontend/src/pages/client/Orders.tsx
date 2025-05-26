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
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Orders;
