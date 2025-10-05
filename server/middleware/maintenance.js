const SiteSetting = require('../models/SiteSetting');

module.exports = async function maintenance(req, res, next) {
  try {
    const path = req.path || '';
    if (path.startsWith('/api/admin') || path.startsWith('/api/health')) return next();
    const setting = await SiteSetting.findOne();
    if (setting?.maintenanceMode) {
      const role = req.user?.role;
      if (role !== 'admin' && role !== 'moderator') {
        return res.status(503).json({ message: 'Maintenance mode' });
      }
    }
    next();
  } catch (e) {
    next();
  }
};
