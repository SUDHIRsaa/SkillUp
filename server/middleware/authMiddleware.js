const jwt = require('jsonwebtoken');

module.exports = function auth(required = true) {
  return (req, res, next) => {
    // Allow preflight requests to pass through without authentication
    if (req.method === 'OPTIONS') return next();
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) return required ? res.status(401).json({ message: 'Unauthorized' }) : next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
