const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authenticateToken = require('../middlewares/auth');

router.get('/ai', authenticateToken, matchController.getAIMatches);

module.exports = router;