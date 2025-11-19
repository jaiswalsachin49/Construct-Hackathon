const express = require('express');
const router = express.Router();
const {getReports,resolveReport,createReport} = require('../controllers/reportController');
const authenticateToken = require('../middlewares/auth');

router.post('/', authenticateToken, createReport);
router.get('/', authenticateToken, getReports); // Admin only
router.put('/:reportId/resolve', authenticateToken, resolveReport);

module.exports = router;