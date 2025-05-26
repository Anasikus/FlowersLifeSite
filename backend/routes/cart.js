const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getCart);
router.post('/', authenticateToken, addToCart);
router.put('/:productId', authenticateToken, updateQuantity);
router.delete('/:productId', authenticateToken, removeFromCart);

module.exports = router;
