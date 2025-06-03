const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Проверка блокировки пользователя
    const [users] = await db.query('SELECT is_blocked FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(401).json({ message: 'Пользователь не найден' });

    if (users[0].is_blocked) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Недопустимый токен' });
  }
};

const tryAuthenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next(); // пользователь — гость

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query('SELECT is_blocked FROM users WHERE id = ?', [decoded.id]);

    if (users.length > 0 && !users[0].is_blocked) {
      req.user = decoded;
    }
  } catch (err) {
    // Если токен битый — продолжаем как гость
  }

  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  tryAuthenticate,
};
