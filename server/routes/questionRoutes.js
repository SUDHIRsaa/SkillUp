const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/questionController');

router.get('/', auth(false), ctrl.list);
router.get('/daily', auth(), ctrl.daily);
// create many random MCQs for testing/admin convenience
router.post('/bulk-random', auth(), requireRole('admin','moderator'), ctrl.bulkCreate);
router.post('/', auth(), requireRole('admin','moderator'), ctrl.create);
router.put('/:id', auth(), requireRole('admin','moderator'), ctrl.update);
router.delete('/:id', auth(), requireRole('admin','moderator'), ctrl.remove);

module.exports = router;
