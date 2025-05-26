const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders
} = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getUserOrders);

module.exports = router;
