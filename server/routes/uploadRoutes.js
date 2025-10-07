const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const ctrl = require('../controllers/uploadController');

// POST /api/upload/image
router.post('/image', upload.single('file'), ctrl.uploadImageFromBuffer);

module.exports = router;
