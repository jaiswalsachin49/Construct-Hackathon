const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const authenticateToken = require('../middlewares/auth');

router.get('/all', badgeController.getAllBadges);
router.get('/:userId', badgeController.getUserBadges);

module.exports = router;