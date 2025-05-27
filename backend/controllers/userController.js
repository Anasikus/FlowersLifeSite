const db = require('../config/db');

// Получение профиля пользователя
const getUserProfile = async (req, res) => {
  const userId = req.user.id; // id из middleware auth

  try {
    const [users] = await db.query(
      `SELECT 
         u.id, u.username,
         c.photo, c.surname, c.name, c.patronymic, 
         c.dateOfBirth, c.mail, a.name AS address
       FROM users u
       JOIN clients c ON u.id = c.idUsers
       LEFT JOIN address a ON c.idAddress = a.idAddress
       WHERE u.id = ?`,
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

// Обновление профиля пользователя
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  let { surname, name, patronymic, dateOfBirth, mail, photo, username, address } = req.body;

  try {
    // Преобразование даты в формат YYYY-MM-DD
    if (dateOfBirth) {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Неверный формат даты' });
      }
      dateOfBirth = date.toISOString().split('T')[0];
    }

    // Обновление таблицы clients
    await db.query(
      `UPDATE clients 
       SET surname = ?, name = ?, patronymic = ?, dateOfBirth = ?, mail = ?, photo = ?
       WHERE idUsers = ?`,
      [surname, name, patronymic, dateOfBirth, mail, photo || null, userId]
    );

    // Обновление таблицы users (телефон)
    if (username) {
      await db.query(
        `UPDATE users SET username = ? WHERE id = ?`,
        [username, userId]
      );
    }

    // Обновление адреса (если передан)
    if (address) {
      // Проверим, существует ли адрес
      const [existing] = await db.query(`SELECT idAddress FROM address WHERE name = ?`, [address]);

      let addressId;
      if (existing.length > 0) {
        addressId = existing[0].idAddress;
      } else {
        // Если адреса нет — создаём
        const [insertResult] = await db.query(`INSERT INTO address (name) VALUES (?)`, [address]);
        addressId = insertResult.insertId;
      }

      await db.query(
        `UPDATE clients SET idAddress = ? WHERE idUsers = ?`,
        [addressId, userId]
      );
    }

    res.status(200).json({ message: 'Профиль успешно обновлён' });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля', error });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
