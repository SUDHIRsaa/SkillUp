const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
// Coding APIs disabled — feature removed
router.use((req, res) => res.status(410).json({ message: 'Coding APIs have been removed from this deployment.' }));

module.exports = router;
