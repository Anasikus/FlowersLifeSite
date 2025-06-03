const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const {
  getAllFeedbackThreads,
  getThreadMessages,
  sendAdminReply,
  closeThread,
  reopenThread,
} = require('../../controllers/adminFeedbackController');

router.use(authenticateToken);

// Только для админов
router.get('/threads', getAllFeedbackThreads); // список обращений
router.get('/threads/:id/messages', getThreadMessages); // сообщения в обращении
router.post('/threads/:id/reply', sendAdminReply); // ответ админа
router.post('/threads/:id/close', closeThread); // закрыть обращение
router.post('/threads/:id/reopen', reopenThread);

module.exports = router;
