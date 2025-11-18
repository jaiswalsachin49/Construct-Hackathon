const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/auth');

router.post('/', authenticateToken, reportController.createReport);
router.get('/', authenticateToken, reportController.getReports); // Admin only
router.put('/:reportId/resolve', authenticateToken, reportController.resolveReport);

module.exports = router;