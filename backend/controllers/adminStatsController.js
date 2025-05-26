const db = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalClients }]] = await db.query('SELECT COUNT(*) AS totalClients FROM clients');

    const [[{ totalItems }]] = await db.query(`
      SELECT IFNULL(SUM(od.count * p.cost), 0) AS totalSum
      FROM orderDetails od
      JOIN products p ON od.idProduct = p.idProducts
    `);

    const [dailyStats] = await db.query(`
      SELECT o.dateCreate AS date, COUNT(o.id) AS count
      FROM orders o
      WHERE o.dateCreate >= CURDATE() - INTERVAL 7 DAY
      GROUP BY o.dateCreate
      ORDER BY o.dateCreate ASC
    `);

    res.json({
      totalOrders,
      totalClients,
      totalSum: parseFloat(totalItems).toFixed(2),
      dailyStats
    });
  } catch (err) {
    console.error('Ошибка аналитики:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAdminStats
};
