const express = require('express');
const router = express.Router();
const { getReports, resolveReport, createReport, testEmail } = require('../controllers/reportController');
const authenticateToken = require('../middlewares/auth');

router.post('/', authenticateToken, createReport);
router.get('/', authenticateToken, getReports); // Admin only
router.get('/test-email', testEmail);
router.put('/:reportId/resolve', authenticateToken, resolveReport);

module.exports = router;