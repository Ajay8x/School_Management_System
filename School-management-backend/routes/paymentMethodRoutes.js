const express = require('express');
const router = express.Router();
const {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  duplicatePaymentMethod
} = require('../controllers/paymentMethodController');

router.route('/')
  .get(getPaymentMethods)
  .post(createPaymentMethod);

router.route('/:id')
  .get(getPaymentMethodById)
  .put(updatePaymentMethod)
  .delete(deletePaymentMethod);

router.post('/:id/duplicate', duplicatePaymentMethod);

module.exports = router;
