const db = require('../config/db');

const getClientIdByUserId = async (userId) => {
  const [result] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
  return result.length > 0 ? result[0].idClients : null;
};

const getFavorites = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    if (!clientId) return res.status(404).json({ message: 'Клиент не найден' });

    const [favorites] = await db.query(
      `SELECT p.* FROM favorites f
       JOIN products p ON p.idProducts = f.idProducts
       WHERE f.idClients = ?`, [clientId]
    );
    res.json(favorites);
  } catch (err) {
    console.error('Ошибка получения избранного:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const { productId } = req.body;

    if (!clientId || !productId) return res.status(400).json({ message: 'Неверные данные' });

    await db.query('INSERT IGNORE INTO favorites (idClients, idProducts) VALUES (?, ?)', [clientId, productId]);
    res.json({ message: 'Товар добавлен в избранное' });
  } catch (err) {
    console.error('Ошибка добавления в избранное:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const productId = req.params.productId;

    await db.query('DELETE FROM favorites WHERE idClients = ? AND idProducts = ?', [clientId, productId]);
    res.json({ message: 'Товар удалён из избранного' });
  } catch (err) {
    console.error('Ошибка удаления из избранного:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  deleteFavorite
};
