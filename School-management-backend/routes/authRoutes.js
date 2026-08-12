const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, studentLogin, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/student-login', studentLogin);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;

