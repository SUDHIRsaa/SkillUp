const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/adminController');
const maintenance = require('./adminMaintenanceRoutes');

// Note: dev-only test endpoints removed to prepare for production.

router.use(auth(), requireRole('admin','moderator'));
router.get('/dashboard', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.post('/users/:id/ban', ctrl.banUser);
router.post('/users/:id/unban', ctrl.unbanUser);
router.get('/submissions', ctrl.listSubmissions);
router.get('/aptitude', ctrl.listAptitudeSubmissions);
// Aptitude subtopics management (admins only)
router.get('/subtopics', ctrl.listAptitudeSubtopics);
router.post('/subtopics', ctrl.createAptitudeSubtopic);
router.post('/subtopics/upsert', ctrl.upsertAptitudeSubtopic);
router.put('/subtopics/:id', ctrl.updateAptitudeSubtopic);

// Admin maintenance endpoints
router.use('/maintenance', maintenance);

module.exports = router;
