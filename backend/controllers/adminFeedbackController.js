const db = require('../config/db');

// Проверка на роль
function checkAdmin(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Доступ запрещен' });
    return false;
  }
  return true;
}

// Получить все обращения
const getAllFeedbackThreads = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const [threads] = await db.query(`
      SELECT id, name, mail, subject, status, created_at
      FROM feedback_threads
      ORDER BY created_at DESC
    `);
    res.json(threads);
  } catch (err) {
    console.error('Ошибка получения обращений:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить сообщения по обращению
const getThreadMessages = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const threadId = req.params.id;

  try {
    const [messages] = await db.query(`
      SELECT id, sender_role AS sender, message AS text, created_at
      FROM feedback_messages
      WHERE thread_id = ?
      ORDER BY created_at ASC
    `, [threadId]);

    res.json(messages);
  } catch (err) {
    console.error('Ошибка получения сообщений:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Ответить на сообщение
const sendAdminReply = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const threadId = req.params.id;
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: 'Пустое сообщение' });

  try {
    await db.query(`
      INSERT INTO feedback_messages (thread_id, sender_role, message)
      VALUES (?, 'admin', ?)
    `, [threadId, text]);

    res.status(201).json({ message: 'Ответ отправлен' });
  } catch (err) {
    console.error('Ошибка отправки ответа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Закрыть обращение
const closeThread = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const threadId = req.params.id;

  try {
    await db.query(`
      UPDATE feedback_threads
      SET status = 'closed'
      WHERE id = ?
    `, [threadId]);

    res.json({ message: 'Обращение закрыто' });
  } catch (err) {
    console.error('Ошибка закрытия обращения:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const reopenThread = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const threadId = req.params.id;

  try {
    await db.query(`
      UPDATE feedback_threads
      SET status = 'open'
      WHERE id = ?
    `, [threadId]);

    res.json({ message: 'Обращение открыто повторно' });
  } catch (err) {
    console.error('Ошибка открытия обращения:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllFeedbackThreads,
  getThreadMessages,
  sendAdminReply,
  reopenThread,
  closeThread
};
