const { getTenantContext } = require('../middlewares/tenant');

module.exports = function tenantPlugin(schema) {
  // Inject sessionId into save operations
  schema.pre('save', function () {
    const { sessionId } = getTenantContext();
    if (sessionId && !this.sessionId) {
      this.sessionId = sessionId;
    }
  });

  // Inject sessionId into update operations
  const updateHooks = ['findOneAndUpdate', 'updateMany', 'updateOne'];
  updateHooks.forEach(hook => {
    schema.pre(hook, function () {
      const { sessionId } = getTenantContext();
      if (sessionId) {
        this.where({ sessionId });
      }
    });
  });

  // Inject sessionId into find operations
  const findHooks = ['find', 'findOne', 'countDocuments', 'count'];
  findHooks.forEach(hook => {
    schema.pre(hook, function () {
      const { sessionId } = getTenantContext();
      if (sessionId) {
        this.where({ sessionId });
      }
    });
  });

  // Handle aggregates
  schema.pre('aggregate', function () {
    const { sessionId } = getTenantContext();
    if (sessionId) {
      const mongoose = require('mongoose');
      this.pipeline().unshift({
        $match: { sessionId: new mongoose.Types.ObjectId(sessionId) }
      });
    }
  });
};
