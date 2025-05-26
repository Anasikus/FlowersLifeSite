const db = require('../config/db');

const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [users] = await db.query(
      'SELECT u.id, u.username, u.role, c.name, c.mail FROM users u JOIN clients c ON u.id = c.idUsers WHERE u.id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getUserProfile,
};
