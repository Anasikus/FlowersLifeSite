const db = require('../config/db');

// Получение профиля пользователя
const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [users] = await db.query(
      `SELECT 
         u.id, u.username,
         c.surname, c.name, c.patronymic, 
         DATE_FORMAT(c.dateOfBirth, '%Y-%m-%d') AS dateOfBirth, 
         c.mail, c.idAddress,
         a.name AS address
       FROM users u
       JOIN clients c ON u.id = c.idUsers
       LEFT JOIN address a ON c.idAddress = a.idAddress
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Добавим URL для получения фото
    const profile = users[0];
    profile.photo = `/users/photo/${userId}`;

    res.json(profile);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление профиля пользователя
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  let { surname, name, patronymic, dateOfBirth, mail, username, address } = req.body;

  const photoBuffer = req.file ? req.file.buffer : null;

  try {
    if (dateOfBirth) {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Неверный формат даты' });
      }
      dateOfBirth = date.toISOString().split('T')[0];
    }

    // Обновление данных клиента
    await db.query(
      `UPDATE clients 
       SET surname = ?, name = ?, patronymic = ?, dateOfBirth = ?, mail = ?, 
           ${photoBuffer ? 'photo = ?,' : ''} idAddress = idAddress
       WHERE idUsers = ?`,
      photoBuffer 
        ? [surname, name, patronymic, dateOfBirth, mail, photoBuffer, userId]
        : [surname, name, patronymic, dateOfBirth, mail, userId]
    );

    // Обновление username
    if (username) {
      await db.query(`UPDATE users SET username = ? WHERE id = ?`, [username, userId]);
    }

    // Обновление адреса
    if (address) {
      await db.query(`UPDATE clients SET idAddress = ? WHERE idUsers = ?`, [address, userId]);
    }

    res.status(200).json({ message: 'Профиль успешно обновлён' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля', error });
  }
};

// Отдача изображения по ID
const getUserPhoto = async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query(`SELECT photo FROM clients WHERE idUsers = ?`, [userId]);
    if (rows.length === 0 || !rows[0].photo) {
      return res.status(404).send('Фото не найдено');
    }

    const photo = rows[0].photo;
    res.setHeader('Content-Type', 'image/jpeg'); // или image/png, если уверены
    res.send(photo);
  } catch (error) {
    console.error('Ошибка получения фото:', error);
    res.status(500).send('Ошибка сервера');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserPhoto,
};
