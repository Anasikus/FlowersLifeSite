const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  changeUserRole,
  blockUser
} = require('../../controllers/adminUsersController');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, requireRole(['admin', 'employee']), getAllUsers);
router.put('/:id/role', authenticateToken, requireRole(['admin', 'employee']), changeUserRole);
router.put('/:id/block', authenticateToken, requireRole(['admin', 'employee']), blockUser);

module.exports = router;
