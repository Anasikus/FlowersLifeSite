const db = require('../config/db');

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.id, o.dateCreate, o.status, c.name AS clientName, u.username AS clientPhone
      FROM orders o
      JOIN clients c ON o.idClients = c.idClients
      JOIN users u ON c.idUsers = u.id
      ORDER BY o.dateCreate DESC
    `);

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const [details] = await db.query(`
      SELECT od.idOrder, od.count, p.idProducts, p.nameProducts, p.cost, p.photo
      FROM orderDetails od
      JOIN products p ON od.idProduct = p.idProducts
      WHERE od.idOrder IN (${placeholders})
    `, orderIds);

    const orderMap = {};
    orders.forEach(order => {
      let [lastName, firstName] = order.clientName.split(' ');
      if (!firstName) firstName = '';
      const displayName = `${order.clientPhone} - ${firstName} ${lastName ? lastName.charAt(0) + '.' : ''}`;

      orderMap[order.id] = {
        id: order.id,
        dateCreate: order.dateCreate,
        status: order.status,
        clientName: displayName,
        products: [],
        total: 0,
      };
    });

    details.forEach(item => {
      const totalPrice = item.count * item.cost;
      orderMap[item.idOrder].products.push({
        idProducts: item.idProducts,
        nameProducts: item.nameProducts,
        count: item.count,
        cost: item.cost,
        photo: item.photo,
        totalPrice,
      });
      orderMap[item.idOrder].total += totalPrice;
    });

    res.json(Object.values(orderMap));
  } catch (err) {
    console.error('Ошибка получения заказов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    res.json({ message: 'Статус обновлён' });
  } catch (err) {
    console.error('Ошибка обновления статуса:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus
};
