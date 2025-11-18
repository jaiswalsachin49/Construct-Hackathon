const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');

// Public routes
router.get('/nearby', authenticateToken, userController.getNearbyUsers);
router.get('/matches', authenticateToken, userController.getBestMatches);
router.get('/search', authenticateToken, userController.searchUsers);
router.get('/:userId', userController.getUserById);

// Protected routes
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/allies/:userId', authenticateToken, userController.addAlly);
router.delete('/allies/:userId', authenticateToken, userController.removeAlly);
router.get('/:userId/allies', userController.getAllies);
router.post('/block/:userId', authenticateToken, userController.blockUser);
router.post('/unblock/:userId', authenticateToken, userController.unblockUser);

module.exports = router;