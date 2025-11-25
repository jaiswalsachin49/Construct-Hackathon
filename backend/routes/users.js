const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');
const upload = require('../config/multer');

// Public routes (Search/Discovery)
router.get('/nearby', authenticateToken, userController.getNearbyUsers);
router.get('/matches', authenticateToken, userController.getBestMatches);
router.get('/search', authenticateToken, userController.searchUsers);
router.get('/:userId', userController.getUserById);

// --- NEW CONNECTION ROUTES ---
router.get('/requests/pending', authenticateToken, userController.getPendingRequests); // Get Notification List
router.post('/request/:userId', authenticateToken, userController.sendConnectionRequest); // Send
router.post('/request/:userId/accept', authenticateToken, userController.acceptConnectionRequest); // Accept
router.post('/request/:userId/reject', authenticateToken, userController.rejectConnectionRequest); // Reject
router.delete('/allies/:userId', authenticateToken, userController.removeAlly); // Remove Ally (Unfriend)
// -----------------------------

// Other routes
// Accept multipart/form-data for profile updates (cover/profile photos + fields)
router.put('/profile', authenticateToken, upload.fields([
	{ name: 'coverPhoto', maxCount: 1 },
	{ name: 'profilePhoto', maxCount: 1 }
]), userController.updateProfile);
router.get('/:userId/allies', userController.getAllies);
router.get('/blocked/list', authenticateToken, userController.getBlockedUsers);
router.post('/block/:userId', authenticateToken, userController.blockUser);
router.post('/unblock/:userId', authenticateToken, userController.unblockUser);

module.exports = router;