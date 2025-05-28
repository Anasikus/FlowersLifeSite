const express = require('express');
const { getUserProfile, updateUserProfile, getUserPhoto } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const upload = multer(); // в память

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile/update', authMiddleware, upload.single('photo'), updateUserProfile);
router.get('/photo/:id', getUserPhoto); // отдаем изображение

module.exports = router;
