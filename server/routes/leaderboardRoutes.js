const router = require('express').Router();
const ctrl = require('../controllers/leaderboardController');

router.get('/', ctrl.list);

module.exports = router;
