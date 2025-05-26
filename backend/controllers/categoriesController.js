const db = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    console.error('Ошибка при получении категорий:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getCategories
};
