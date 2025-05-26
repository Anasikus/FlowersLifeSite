const db = require('../config/db');

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.id, o.dateCreate, o.status, c.name AS clientName
      FROM orders o
      JOIN clients c ON o.idClients = c.idClients
      ORDER BY o.dateCreate DESC
    `);

    res.json(orders);
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
