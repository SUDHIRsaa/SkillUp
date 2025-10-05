const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/performanceController');

router.get('/me', auth(), ctrl.getStats);
router.post('/attempt', auth(), ctrl.submitAttempt);

module.exports = router;
