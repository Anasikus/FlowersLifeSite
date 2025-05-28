import { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';

interface OrderProduct {
  idProducts: number;
  nameProducts: string;
  count: number;
  cost: number;
  photo: string;
  totalPrice: number;
}

interface Order {
  id: number;
  dateCreate: string;
  status: string;
  clientName: string;
  products: OrderProduct[];
  total: number;
}

const statuses = [
  "Отказано",
  "В обработке",
  "В работе",
  "Готов к получению",
  "Выдан"
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setOrders(data);
        } else {
          console.error('Ошибка загрузки заказов:', data.message);
        }
      } catch (err) {
        console.error('Ошибка запроса:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(order =>
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:4000/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert(data.message || 'Ошибка обновления статуса');
      }
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  if (loading) return <p>Загрузка заказов...</p>;
  if (orders.length === 0) return <p>Заказы отсутствуют.</p>;

  return (
    <>
      <AdminHeader />
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2>📋 Заказы (Админская панель)</h2>
        <input
          type="text"
          placeholder="Поиск по пользователю или номеру заказа..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ margin: "1rem 0", padding: "0.5rem", width: "100%" }}
        />

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredOrders.map(order => (
            <li key={order.id} style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1.5rem', padding: '1rem' }}>
              <h3>Заказ №{order.id}</h3>
              <p><strong>Пользователь:</strong> {order.clientName}</p>
              <p><strong>Дата оформления:</strong> {new Date(order.dateCreate).toLocaleString()}</p>
              <p>
                <strong>Статус: </strong>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </p>
              <h4>Товары:</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                {order.products.map(product => (
                  <li key={product.idProducts} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <img
                      src={product.photo ? `http://localhost:4000/${product.photo}` : "/placeholder.png"}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '1rem' }}
                    />
                    <div>
                      <p><strong>{product.nameProducts}</strong></p>
                      <p>Цена за штуку: {product.cost} ₽</p>
                      <p>Количество: {product.count}</p>
                      <p>Сумма: {product.totalPrice.toFixed(2)} ₽</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p><strong>Итоговая стоимость: {order.total.toFixed(2)} ₽</strong></p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default AdminOrders;
