const { AsyncLocalStorage } = require('async_hooks');

const tenantStorage = new AsyncLocalStorage();

const tenantMiddleware = (req, res, next) => {
  const schoolId = req.headers['x-school-id'];
  const sessionId = req.headers['x-session-id'];
  
  tenantStorage.run({ schoolId, sessionId }, () => {
    next();
  });
};

const getTenantContext = () => {
  return tenantStorage.getStore() || {};
};

module.exports = { tenantMiddleware, getTenantContext };
