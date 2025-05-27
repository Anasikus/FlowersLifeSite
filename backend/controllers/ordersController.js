const db = require('../config/db');

// Получение ID клиента по ID пользователя
const getClientIdByUserId = async (userId) => {
  const [result] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
  return result.length > 0 ? result[0].idClients : null;
};

// Создание заказа
const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    if (!clientId) return res.status(404).json({ message: 'Клиент не найден' });

    // Получаем корзину
    const [basket] = await db.query(
      'SELECT idProducts, count FROM basket WHERE idClients = ?',
      [clientId]
    );

    if (basket.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    // Проверка остатков
    const productIds = basket.map(item => item.idProducts);
    const placeholders = productIds.map(() => '?').join(',');

    const [products] = await db.query(
      `SELECT idProducts, count FROM products WHERE idProducts IN (${placeholders})`,
      productIds
    );

    const stockMap = {};
    for (const p of products) {
      stockMap[p.idProducts] = p.count;
    }

    for (const item of basket) {
      const available = stockMap[item.idProducts];
      if (available === undefined || available < item.count) {
        return res.status(400).json({
          message: `Недостаточно товара на складе: товар ID ${item.idProducts}`,
        });
      }
    }

    // Транзакция: создаём заказ, вычитаем остатки, очищаем корзину
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      'INSERT INTO orders (idClients, dateCreate, status) VALUES (?, NOW(), ?)',
      [clientId, 'В обработке']
    );
    const orderId = orderResult.insertId;

    for (const item of basket) {
      // Добавляем в детали заказа
      await connection.query(
        'INSERT INTO orderDetails (idOrder, idProduct, count) VALUES (?, ?, ?)',
        [orderId, item.idProducts, item.count]
      );

      // Уменьшаем остаток
      await connection.query(
        'UPDATE products SET count = count - ? WHERE idProducts = ?',
        [item.count, item.idProducts]
      );
    }

    // Очищаем корзину
    await connection.query('DELETE FROM basket WHERE idClients = ?', [clientId]);

    await connection.commit();
    res.status(201).json({ message: 'Заказ успешно оформлен', orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Ошибка при оформлении заказа:', err);
    res.status(500).json({ message: 'Ошибка сервера при оформлении заказа' });
  } finally {
    connection.release();
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
const repeatOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const clientId = await getClientIdByUserId(req.user.id);

    // Получить детали заказа
    const [items] = await db.query(
      `SELECT idProduct, count FROM orderDetails WHERE idOrder = ?`,
      [orderId]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Заказ не найден или пуст" });
    }

    // Добавить каждый товар в корзину
    for (const item of items) {
      await db.query(
        `
        INSERT INTO basket (idClients, idProducts, count)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE count = count + ?
        `,
        [clientId, item.idProduct, item.count, item.count]
      );
    }

    res.json({ message: "Товары добавлены в корзину" });
  } catch (err) {
    console.error("Ошибка повторения заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const clientId = await getClientIdByUserId(req.user.id);

    // Проверка принадлежности заказа клиенту
    const [orderCheck] = await db.query(
      `SELECT id FROM orders WHERE id = ? AND idClients = ?`,
      [orderId, clientId]
    );

    if (orderCheck.length === 0) {
      return res.status(403).json({ message: "Нет доступа к заказу" });
    }

    await db.query(
      `UPDATE orders SET status = 'Отменён' WHERE id = ?`,
      [orderId]
    );

    res.json({ message: "Заказ отменён" });
  } catch (err) {
    console.error("Ошибка отмены заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
  repeatOrder,
  cancelOrder,
};
