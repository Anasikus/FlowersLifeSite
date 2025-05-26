const db = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, role, is_blocked FROM users ORDER BY id DESC'
    );
    res.json(users);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const changeUserRole = async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!['user', 'employee', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }

  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    res.json({ message: 'Роль пользователя обновлена' });
  } catch (err) {
    console.error('Ошибка смены роли:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const blockUser = async (req, res) => {
  const userId = req.params.id;
  const { isBlocked } = req.body; // true или false

  try {
    await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [isBlocked, userId]);
    res.json({ message: isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован' });
  } catch (err) {
    console.error('Ошибка блокировки пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllUsers,
  changeUserRole,
  blockUser
};
