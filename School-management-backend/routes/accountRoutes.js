const express = require('express');
const router = express.Router();
const { 
  getAccounts, 
  createAccount, 
  updateAccount, 
  deleteAccount 
} = require('../controllers/accountController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getAccounts)
  .post(protect, authRole('admin', 'super-admin'), createAccount);

router.route('/:id')
  .put(protect, authRole('admin', 'super-admin'), updateAccount)
  .delete(protect, authRole('admin', 'super-admin'), deleteAccount);

module.exports = router;
