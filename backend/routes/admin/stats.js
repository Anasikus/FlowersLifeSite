const express = require('express');
const router = express.Router();
const {
  getAdminStats
} = require('../../controllers/adminStatsController');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin']), getAdminStats);

module.exports = router;
