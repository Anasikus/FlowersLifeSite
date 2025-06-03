const express = require('express');
const router = express.Router();
const {
  createFeedbackThread,
  getUserThreadsWithMessages,
  addMessageToThread,
  getThreadMessages
} = require('../controllers/feedbackController');
const { authenticateToken, tryAuthenticate } = require('../middleware/authMiddleware');

// Создание обращения — открыт всем
router.post('/', tryAuthenticate, createFeedbackThread);

// Получение обращений с сообщениями — только авторизованные
router.get('/', authenticateToken, getUserThreadsWithMessages);

// Добавление сообщения — только авторизованные
router.post('/:id/messages', authenticateToken, addMessageToThread);

router.get('/:id/messages', authenticateToken, getThreadMessages);


module.exports = router;
