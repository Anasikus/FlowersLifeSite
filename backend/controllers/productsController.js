const db = require('../config/db');

const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM products';
    const params = [];

    if (category) {
      query += ' WHERE codeCategory = ?';
      params.push(category);
    }

    if (search) {
      query += category ? ' AND' : ' WHERE';
      query += ' nameProducts LIKE ?';
      params.push(`%${search}%`);
    }

    const [products] = await db.query(query, params);
    res.json(products);
  } catch (err) {
    console.error('Ошибка при получении товаров:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllProducts
};
