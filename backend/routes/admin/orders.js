const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus
} = require('../../controllers/adminOrdersController');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'employee']), getAllOrders);
router.put('/:orderId', authenticateToken, requireRole(['admin', 'employee']), updateOrderStatus);

module.exports = router;
