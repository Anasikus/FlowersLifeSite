const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile/update', authMiddleware, updateUserProfile);

module.exports = router;
