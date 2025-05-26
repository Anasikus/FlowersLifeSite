const db = require('../config/db');

// Получение ID клиента по ID пользователя
const getClientIdByUserId = async (userId) => {
  const [result] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
  return result.length > 0 ? result[0].idClients : null;
};

// Создание заказа
const createOrder = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    if (!clientId) return res.status(404).json({ message: 'Клиент не найден' });

    const [basket] = await db.query(
      'SELECT idProducts, count FROM basket WHERE idClients = ?',
      [clientId]
    );

    if (basket.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    const [orderResult] = await db.query(
      'INSERT INTO orders (idClients, dateCreate, status) VALUES (?, NOW(), ?)',
      [clientId, 'В обработке']
    );

    const orderId = orderResult.insertId;

    for (const item of basket) {
      await db.query(
        'INSERT INTO orderDetails (idOrder, idProduct, count) VALUES (?, ?, ?)',
        [orderId, item.idProducts, item.count]
      );
    }

    await db.query('DELETE FROM basket WHERE idClients = ?', [clientId]);

    res.status(201).json({ message: 'Заказ успешно оформлен', orderId });
  } catch (err) {
    console.error('Ошибка при оформлении заказа:', err);
    res.status(500).json({ message: 'Ошибка сервера при оформлении заказа' });
  }
};

// Получение заказов клиента
const getUserOrders = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    if (!clientId) return res.status(404).json({ message: 'Клиент не найден' });

    const [orders] = await db.query(
      'SELECT id, dateCreate, status FROM orders WHERE idClients = ? ORDER BY dateCreate DESC',
      [clientId]
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const [details] = await db.query(
      `
      SELECT od.idOrder, od.count, p.idProducts, p.nameProducts, p.cost, p.photo
      FROM orderDetails od
      JOIN products p ON od.idProduct = p.idProducts
      WHERE od.idOrder IN (${placeholders})
      `,
      orderIds
    );

    const orderMap = {};
    for (const order of orders) {
      orderMap[order.id] = {
        id: order.id,
        dateCreate: order.dateCreate,
        status: order.status,
        products: [],
        total: 0,
      };
    }

    for (const item of details) {
      const totalPrice = Number(item.count) * Number(item.cost);
      orderMap[item.idOrder].products.push({
        idProducts: item.idProducts,
        nameProducts: item.nameProducts,
        count: item.count,
        cost: Number(item.cost),
        photo: item.photo,
      });
      orderMap[item.idOrder].total += totalPrice;
    }

    const ordersWithDetails = Object.values(orderMap);
    res.json(ordersWithDetails);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении заказов' });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
};
