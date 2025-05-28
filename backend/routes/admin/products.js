const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../../controllers/adminProductsController');

const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/img'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// 🔐 Защита всех маршрутов
router.get('/', authenticateToken, requireRole(['admin', 'employee']), getAllProducts);
router.post('/', authenticateToken, requireRole(['admin', 'employee']), upload.single('photo'), createProduct);
router.put('/:id', authenticateToken, requireRole(['admin', 'employee']), upload.single('photo'), updateProduct);
router.delete('/:id', authenticateToken, requireRole(['admin', 'employee']), deleteProduct);

module.exports = router;
