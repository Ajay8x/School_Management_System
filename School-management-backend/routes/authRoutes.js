const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, studentLogin, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/student-login', studentLogin);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
