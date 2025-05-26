const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsForProduct
} = require('../controllers/reviewsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, addReview);
router.get('/:productId', getReviewsForProduct);

module.exports = router;
