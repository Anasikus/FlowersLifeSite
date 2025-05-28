const db = require('../config/db');

const getClientIdByUserId = async (userId) => {
  const [result] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
  return result.length > 0 ? result[0].idClients : null;
};

const addReview = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const { idProduct, rating, text } = req.body;

    if (!clientId || !idProduct || !rating) {
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    // Проверка: был ли товар в заказе клиента
    const [ordered] = await db.query(
      `SELECT od.*
       FROM orderDetails od
       JOIN orders o ON od.idOrder = o.id
       WHERE o.idClients = ? AND od.idProduct = ?`,
      [clientId, idProduct]
    );

    if (ordered.length === 0) {
      return res.status(403).json({
        message: 'Вы не можете оставить отзыв на товар, который не заказывали'
      });
    }

    // Проверка: уже есть отзыв на этот товар?
    const [existing] = await db.query(
      `SELECT * FROM reviews WHERE idClients = ? AND idProduct = ?`,
      [clientId, idProduct]
    );

    if (existing.length > 0) {
      // Обновляем отзыв
      await db.query(
        `UPDATE reviews SET rating = ?, text = ? WHERE idClients = ? AND idProduct = ?`,
        [rating, text || null, clientId, idProduct]
      );
      return res.status(200).json({ message: 'Отзыв обновлён' });
    }

    // Добавление нового отзыва
    await db.query(
      'INSERT INTO reviews (idClients, idProduct, rating, text) VALUES (?, ?, ?, ?)',
      [clientId, idProduct, rating, text || null]
    );

    res.status(201).json({ message: 'Отзыв добавлен' });
  } catch (err) {
    console.error('Ошибка добавления отзыва:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getReviewsForProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const [reviews] = await db.query(
      `SELECT r.*, c.name FROM reviews r
       JOIN clients c ON r.idClients = c.idClients
       WHERE r.idProduct = ?`,
      [productId]
    );

    res.json(reviews);
  } catch (err) {
    console.error('Ошибка получения отзывов:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  addReview,
  getReviewsForProduct
};
