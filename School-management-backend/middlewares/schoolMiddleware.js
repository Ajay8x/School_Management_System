/**
 * School Middleware
 * Reads X-School-ID header from the request and attaches to req.schoolId.
 * All controllers use req.schoolId to scope data queries to the active school.
 */
const schoolMiddleware = (req, res, next) => {
  const schoolId = req.headers['x-school-id'];
  req.schoolId = schoolId || null;
  next();
};

module.exports = schoolMiddleware;
