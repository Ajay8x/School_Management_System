const express = require('express');
const router = express.Router();
const {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organizationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getOrganizations)
  .post(createOrganization);

router.route('/:id')
  .put(updateOrganization)
  .delete(deleteOrganization);

module.exports = router;
