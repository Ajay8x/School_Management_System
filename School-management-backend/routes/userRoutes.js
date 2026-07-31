const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, getUserCredentials, resetUserPassword } = require('../controllers/userController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// All routes here are protected
router.use(protect);

// Get users (Admins and SuperAdmins can see list)
router.get('/', authRole('admin', 'super-admin'), getUsers);

// Get user credentials (SuperAdmin only)
router.get('/credentials', authRole('super-admin'), getUserCredentials);

// Reset user password (SuperAdmin only)
router.put('/:id/reset-password', authRole('super-admin'), resetUserPassword);

// Only SuperAdmin can modify roles or delete users
router.put('/:id/role', authRole('super-admin'), updateUserRole);
router.delete('/:id', authRole('super-admin'), deleteUser);

module.exports = router;
