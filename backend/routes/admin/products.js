const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../../controllers/adminProductsController');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'employee']), getAllProducts);
router.post('/', authenticateToken, requireRole(['admin', 'employee']), createProduct);
router.put('/:id', authenticateToken, requireRole(['admin', 'employee']), updateProduct);
router.delete('/:id', authenticateToken, requireRole(['admin', 'employee']), deleteProduct);

module.exports = router;
