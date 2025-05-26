const db = require('../config/db');

const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения товаров:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const createProduct = async (req, res) => {
  const { nameProducts, cost, photo, codeCategory, count } = req.body;

  if (!nameProducts || !cost || !codeCategory) {
    return res.status(400).json({ message: 'Не все поля заполнены' });
  }

  try {
    await db.query(
      'INSERT INTO products (nameProducts, cost, photo, codeCategory, count) VALUES (?, ?, ?, ?, ?)',
      [nameProducts, cost, photo, codeCategory, count || 0]
    );
    res.status(201).json({ message: 'Товар добавлен' });
  } catch (err) {
    console.error('Ошибка добавления товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { nameProducts, cost, photo, codeCategory, count } = req.body;

  try {
    await db.query(
      `UPDATE products
       SET nameProducts = ?, cost = ?, photo = ?, codeCategory = ?, count = ?
       WHERE idProducts = ?`,
      [nameProducts, cost, photo, codeCategory, count, id]
    );
    res.json({ message: 'Товар обновлён' });
  } catch (err) {
    console.error('Ошибка обновления товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM products WHERE idProducts = ?', [id]);
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    console.error('Ошибка удаления товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
