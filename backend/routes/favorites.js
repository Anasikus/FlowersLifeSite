const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  deleteFavorite
} = require('../controllers/favoritesController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getFavorites);
router.post('/', authenticateToken, addFavorite);
router.delete('/:productId', authenticateToken, deleteFavorite);

module.exports = router;
