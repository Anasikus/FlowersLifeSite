const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/adminCategoriesController');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'employee']), getAllCategories);
router.post('/', authenticateToken, requireRole(['admin', 'employee']), createCategory);
router.put('/:id', authenticateToken, requireRole(['admin', 'employee']), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['admin', 'employee']), deleteCategory);

module.exports = router;
