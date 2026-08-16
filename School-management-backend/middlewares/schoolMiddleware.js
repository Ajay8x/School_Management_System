const mongoose = require('mongoose');

/**
 * School Middleware
 * Reads X-School-ID header from the request and attaches to req.schoolId.
 * All controllers use req.schoolId to scope data queries to the active school.
 */
const schoolMiddleware = (req, res, next) => {
  const schoolId = req.headers['x-school-id'];
  if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
    req.schoolId = schoolId;
  } else {
    req.schoolId = null;
  }
  next();
};

module.exports = schoolMiddleware;
