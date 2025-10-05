const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/toolsController');

// Generation endpoints removed per project request. Keep diagnostics only.
router.get('/diagnostics', ctrl.diagnostics);

module.exports = router;
