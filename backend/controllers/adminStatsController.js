const db = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Проверка и установка значений по умолчанию
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);

    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalClients }]] = await db.query('SELECT COUNT(*) AS totalClients FROM clients');

    const [[{ totalSum }]] = await db.query(`
      SELECT IFNULL(SUM(od.count * p.cost), 0) AS totalSum
      FROM orderDetails od
      JOIN products p ON od.idProduct = p.idProducts
      JOIN orders o ON od.idOrder = o.id
      WHERE o.dateCreate BETWEEN ? AND ?
    `, [start, end]);

    const [dailyStats] = await db.query(`
      SELECT o.dateCreate AS date, COUNT(o.id) AS count
      FROM orders o
      WHERE o.dateCreate BETWEEN ? AND ?
      GROUP BY o.dateCreate
      ORDER BY o.dateCreate ASC
    `, [start, end]);
    
    const [[{ totalReviews, averageRating }]] = await db.query(`
      SELECT COUNT(*) AS totalReviews, AVG(rating) AS averageRating
      FROM reviews
    `);

      const [allReviews] = await db.query(`
        SELECT r.id, r.rating, r.text, r.created_at, c.surname, c.name
        FROM reviews r
        JOIN clients c ON r.idClients = c.idClients
        ORDER BY r.created_at DESC
      `);

      res.json({
        totalOrders,
        totalClients,
        totalSum: parseFloat(totalSum).toFixed(2),
        dailyStats,
        totalReviews,
        averageRating: averageRating ? parseFloat(averageRating).toFixed(2) : "0.00",
        allReviews
      });

  } catch (err) {
    console.error('Ошибка аналитики:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAdminStats
};
