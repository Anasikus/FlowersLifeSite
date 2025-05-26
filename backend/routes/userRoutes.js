const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
