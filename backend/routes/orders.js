const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  repeatOrder,
  cancelOrder,
} = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getUserOrders);

// Добавил параметр orderId и использую правиль middleware и контроллер
router.post('/:orderId/repeat', authenticateToken, repeatOrder);
router.put('/:orderId/cancel', authenticateToken, cancelOrder);

module.exports = router;
