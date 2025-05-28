const db = require('../config/db');
const path = require('path');
const fs = require('fs');

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

const createProduct = async (req, res) => {
  try {
    const { nameProducts, cost, codeCategory, quantity } = req.body;
    const photo = req.file ? 'img/' + req.file.filename : null;

    if (!nameProducts || !cost || !codeCategory) {
      return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
    }

    const [result] = await db.query(
      `INSERT INTO products (nameProducts, cost, photo, codeCategory, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [nameProducts, cost, photo, codeCategory, quantity || 0]
    );

    res.status(201).json({ message: 'Товар добавлен', id: result.insertId });
  } catch (err) {
    console.error('Ошибка при добавлении товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameProducts, cost, codeCategory, quantity } = req.body;

    // Получаем текущий товар
    const [[existingProduct]] = await db.query('SELECT photo FROM products WHERE idProducts = ?', [id]);

    let updateQuery = `
      UPDATE products
      SET nameProducts = ?, cost = ?, codeCategory = ?, quantity = ?
    `;
    const params = [nameProducts, cost, codeCategory, quantity || 0];

    if (req.file) {
      const newPhoto = 'img/' + req.file.filename;

      // Удаляем старое изображение
      if (existingProduct && existingProduct.photo) {
        const oldPath = path.join(__dirname, '..', 'public', existingProduct.photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateQuery += ', photo = ?';
      params.push(newPhoto);
    }

    updateQuery += ' WHERE idProducts = ?';
    params.push(id);

    await db.query(updateQuery, params);
    res.json({ message: 'Товар обновлён' });
  } catch (err) {
    console.error('Ошибка при обновлении товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Удаление изображения
    const [[product]] = await db.query('SELECT photo FROM products WHERE idProducts = ?', [id]);
    if (product && product.photo) {
      const filePath = path.join(__dirname, '..', 'public', product.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM products WHERE idProducts = ?', [id]);
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    console.error('Ошибка при удалении товара:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
