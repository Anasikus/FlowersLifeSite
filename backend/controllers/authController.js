const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Утилита для очистки номера от лишних символов
const cleanPhone = (value) => value.replace(/\D/g, '');

const registerUser = async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    // Проверка на существующего пользователя (по чистому номеру)
    const cleanUsername = cleanPhone(username);
    const [existing] = await db.query(
    'SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(username, " ", ""), "(", ""), ")", ""), "-", ""), "+", ""), "_", "") = ?',
    [cleanUsername]
  );

  if (existing.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Сохраняем номер в маске
  const [userResult] = await db.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role]
  );

  const userId = userResult.insertId;

  // Автоматическое создание клиента, сохраняем номер с маской
  await db.query(
    'INSERT INTO clients (name, mail, idUsers) VALUES (?, ?, ?)',
    ['Имя клиента', username, userId]
  );

  res.status(201).json({ message: 'Пользователь зарегистрирован и клиент создан', userId });

  } catch (error) {
  console.error('Ошибка регистрации:', error);
  res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
  return res.status(400).json({ message: 'Введите логин и пароль' });
  }

  try {
  const cleanUsername = cleanPhone(username);
  // Ищем пользователя по «очищенному» номеру
  const [users] = await db.query(
    'SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(username, " ", ""), "(", ""), ")", ""), "-", ""), "+", ""), "_", "") = ?',
    [cleanUsername]
  );

  const user = users[0];

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  if (user.is_blocked) {
    return res.status(403).json({ message: 'Пользователь заблокирован' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Неверный пароль' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ message: 'Успешный вход', token, user });
  } catch (error) {
  console.error('Ошибка входа:', error);
  res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};