const db = require('../config/db');

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    console.error('Ошибка получения категорий:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const createCategory = async (req, res) => {
  const { nameCategory } = req.body;
  if (!nameCategory) {
    return res.status(400).json({ message: 'Название обязательно' });
  }

  try {
    await db.query('INSERT INTO categories (title) VALUES (?)', [nameCategory]);
    res.status(201).json({ message: 'Категория добавлена' });
  } catch (err) {
    console.error('Ошибка добавления категории:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updateCategory = async (req, res) => {
  const id = req.params.id;
  const { nameCategory } = req.body;

  try {
    await db.query('UPDATE categories SET title = ? WHERE idCategory = ?', [nameCategory, id]);
    res.json({ message: 'Категория обновлена' });
  } catch (err) {
    console.error('Ошибка обновления категории:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteCategory = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM categories WHERE idCategory = ?', [id]);
    res.json({ message: 'Категория удалена' });
  } catch (err) {
    console.error('Ошибка удаления категории:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
