const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Защищённый маршрут для любого авторизованного пользователя
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Добро пожаловать!', user: req.user });
});

// Только для админов
router.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Привет, админ!' });
});

module.exports = router;
