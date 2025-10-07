const router = require('express').Router();
// All coding endpoints removed in this deployment; return 410
router.use((req, res) => res.status(410).json({ message: 'Coding APIs have been removed from this deployment.' }));
module.exports = router;
