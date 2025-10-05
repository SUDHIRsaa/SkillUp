const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', [
  body('name').notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').optional().isLength({ min: 6 })
], ctrl.register);

router.post('/login', ctrl.loginWithPassword);
router.get('/me', auth(), ctrl.me);
router.get('/check', ctrl.checkAvailability);
router.patch('/profile', auth(), ctrl.updateProfile);

module.exports = router;
