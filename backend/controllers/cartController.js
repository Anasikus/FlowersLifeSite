const db = require('../config/db');

const getClientIdByUserId = async (userId) => {
  const [result] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
  return result.length > 0 ? result[0].idClients : null;
};

const getCart = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    if (!clientId) return res.status(404).json({ message: 'Клиент не найден' });

    const [items] = await db.query(`
      SELECT 
        b.idBasket, 
        b.count, 
        p.idProducts,
        p.nameProducts AS name,
        p.photo AS image,
        p.cost,
        p.count AS availableStock
      FROM basket b
      JOIN products p ON b.idProducts = p.idProducts
      WHERE b.idClients = ?
    `, [clientId]);

    // Автоматически уменьшаем count до max availableStock, если превышает
    const updates = [];
    for (const item of items) {
      if (item.count > item.availableStock) {
        item.count = item.availableStock;
        updates.push(db.query(
          'UPDATE basket SET count = ? WHERE idBasket = ?',
          [item.availableStock, item.idBasket]
        ));
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    res.json(items);
  } catch (err) {
    console.error('Ошибка получения корзины:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


const addToCart = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const { productId, count } = req.body;

    if (!clientId || !productId || !count) {
      return res.status(400).json({ message: 'Данные некорректны' });
    }

    const [[product]] = await db.query('SELECT count FROM products WHERE idProducts = ?', [productId]);
    if (!product || count > product.count) {
      return res.status(400).json({ message: `Недостаточно товара на складе (в наличии: ${product?.count || 0})` });
    }

    const [existing] = await db.query(
      'SELECT * FROM basket WHERE idClients = ? AND idProducts = ?',
      [clientId, productId]
    );

    if (existing.length > 0) {
      const newCount = existing[0].count + count;
      if (newCount > product.count) {
        return res.status(400).json({ message: `Всего на складе: ${product.count}, в корзине уже: ${existing[0].count}` });
      }

      await db.query(
        'UPDATE basket SET count = ? WHERE idClients = ? AND idProducts = ?',
        [newCount, clientId, productId]
      );
    } else {
      await db.query(
        'INSERT INTO basket (idClients, idProducts, count) VALUES (?, ?, ?)',
        [clientId, productId, count]
      );
    }

    res.json({ message: 'Товар добавлен в корзину' });
  } catch (err) {
    console.error('Ошибка добавления в корзину:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


const updateQuantity = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const productId = req.params.productId;
    const { count } = req.body;

    if (!clientId || !productId || count == null) {
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    const [[product]] = await db.query('SELECT count FROM products WHERE idProducts = ?', [productId]);
    if (!product || count > product.count) {
      return res.status(400).json({ message: `Недостаточно товара на складе (в наличии: ${product?.count || 0})` });
    }

    await db.query(
      'UPDATE basket SET count = ? WHERE idClients = ? AND idProducts = ?',
      [count, clientId, productId]
    );

    res.json({ message: 'Количество обновлено' });
  } catch (err) {
    console.error('Ошибка обновления количества:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const clientId = await getClientIdByUserId(req.user.id);
    const productId = req.params.productId;

    await db.query(
      'DELETE FROM basket WHERE idClients = ? AND idProducts = ?',
      [clientId, productId]
    );

    res.json({ message: 'Товар удалён из корзины' });
  } catch (err) {
    console.error('Ошибка удаления из корзины:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart
};
