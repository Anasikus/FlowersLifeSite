// controllers/feedbackController.js
const db = require('../config/db');

// Получение clientId по userId
const getClientIdByUserId = async (userId) => {
  try {
    console.log('getClientIdByUserId userId:', userId);
    const [rows] = await db.query('SELECT idClients FROM clients WHERE idUsers = ?', [userId]);
    console.log('getClientIdByUserId rows:', rows);
    if (rows.length > 0) {
      return rows[0].idClients;
    }
    return null;
  } catch (err) {
    console.error('getClientIdByUserId ошибка:', err);
    return null;
  }
};

// Создание обращения (все могут)
const createFeedbackThread = async (req, res) => {
  try {
    const user = req.user || null;
    console.log('createFeedbackThread user:', user);
    const { subject, message, name, mail } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Тема и сообщение обязательны' });
    }

    let clientId = null;
    let clientName = name;
    let clientEmail = mail;

    if (user) {
      // Проверяем, что user.id существует
      const userId = user.id || user.userId || null;
      if (!userId) {
        return res.status(400).json({ message: 'Неверные данные пользователя' });
      }

      clientId = await getClientIdByUserId(userId);
      if (clientId === null) {
        return res.status(403).json({ message: 'Пользователь не связан с клиентом' });
      }

      // Получаем name и email из базы, чтобы не принимать их из запроса
      const [rows] = await db.query('SELECT name, mail FROM clients WHERE idClients = ?', [clientId]);
      if (rows.length > 0) {
        clientName = rows[0].name;
        clientEmail = rows[0].mail;
      }
    } else {
      // Для гостей обязательны name и email
      if (!name || !mail) {
        return res.status(400).json({ message: 'Для гостей обязательны имя и email' });
      }
    }

    // Вставляем обращение
    const [result] = await db.query(
      'INSERT INTO feedback_threads (idClient, name, mail, subject) VALUES (?, ?, ?, ?)',
      [clientId, clientName, clientEmail, subject]
    );

    const threadId = result.insertId;

    // Вставляем первое сообщение
    await db.query(
      'INSERT INTO feedback_messages (thread_id, sender_role, message) VALUES (?, ?, ?)',
      [threadId, 'user', message]
    );

    res.status(201).json({ message: 'Обращение создано', threadId });
  } catch (err) {
    console.error('Ошибка создания обращения:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение обращений текущего авторизованного клиента вместе с сообщениями
const getUserThreadsWithMessages = async (req, res) => {
  try {
    const user = req.user;
    console.log('getUserThreadsWithMessages user:', user);
    if (!user) return res.status(401).json({ message: 'Требуется авторизация' });

    const userId = user.id || user.userId || null;
    if (!userId) {
      return res.status(400).json({ message: 'Неверные данные пользователя' });
    }

    const clientId = await getClientIdByUserId(userId);
    if (clientId === null) {
      return res.status(403).json({ message: 'Пользователь не связан с клиентом' });
    }

    // Получаем все обращения клиента
    const [threads] = await db.query(
      'SELECT id, subject, status, created_at FROM feedback_threads WHERE idClient = ? ORDER BY created_at DESC',
      [clientId]
    );

    // Получаем сообщения для каждого обращения
    const threadsWithMessages = await Promise.all(
      threads.map(async (thread) => {
        const [messages] = await db.query(
          'SELECT id, sender_role, message, created_at FROM feedback_messages WHERE thread_id = ? ORDER BY created_at ASC',
          [thread.id]
        );
        return { ...thread, messages };
      })
    );

    res.json(threadsWithMessages);
  } catch (err) {
    console.error('Ошибка получения обращений:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавление сообщения в обращение (только авторизованные)
const addMessageToThread = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Требуется авторизация' });

    const { threadId, message } = req.body;
    if (!threadId || !message) return res.status(400).json({ message: 'Некорректные данные' });

    const userId = user.id || user.userId || null;
    if (!userId) {
      return res.status(400).json({ message: 'Неверные данные пользователя' });
    }

    const clientId = await getClientIdByUserId(userId);
    if (clientId === null) return res.status(403).json({ message: 'Пользователь не связан с клиентом' });

    const [threads] = await db.query('SELECT * FROM feedback_threads WHERE id = ? AND idClient = ?', [threadId, clientId]);
    if (threads.length === 0) return res.status(404).json({ message: 'Обращение не найдено' });

    const thread = threads[0];
    if (thread.status === 'closed') return res.status(403).json({ message: 'Обращение закрыто' });

    await db.query(
      'INSERT INTO feedback_messages (thread_id, sender_role, message) VALUES (?, ?, ?)',
      [threadId, 'user', message]
    );

    res.status(201).json({ message: 'Сообщение добавлено' });
  } catch (err) {
    console.error('Ошибка добавления сообщения:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getThreadMessages = async (req, res) => {
  try {
    const user = req.user;
    const threadId = req.params.id;

    if (!user || !threadId) return res.status(400).json({ message: 'Некорректный запрос' });

    const userId = user.id || user.userId;
    const clientId = await getClientIdByUserId(userId);
    if (!clientId) return res.status(403).json({ message: 'Доступ запрещён' });

    // Проверим, принадлежит ли обращение этому клиенту
    const [threads] = await db.query('SELECT id FROM feedback_threads WHERE id = ? AND idClient = ?', [threadId, clientId]);
    if (threads.length === 0) return res.status(404).json({ message: 'Обращение не найдено' });

    const [messages] = await db.query(
      'SELECT id, sender_role AS sender, message AS text, created_at FROM feedback_messages WHERE thread_id = ? ORDER BY created_at ASC',
      [threadId]
    );

    res.json(messages);
  } catch (err) {
    console.error('Ошибка получения сообщений:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


module.exports = {
  createFeedbackThread,
  getUserThreadsWithMessages,
  addMessageToThread,
  getThreadMessages,
};
