const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authenticateToken = require('../middlewares/auth');
const upload = require('../config/multer');

router.get('/nearby', authenticateToken, communityController.getNearbyCommunities);
router.get('/my', authenticateToken, communityController.getMyCommunities);
router.post('/', authenticateToken, upload.single('coverImage'), communityController.createCommunity);
router.get('/:communityId', communityController.getCommunity);
router.post('/:communityId/join', authenticateToken, communityController.joinCommunity);
router.post('/:communityId/leave', authenticateToken, communityController.leaveCommunity);
router.get('/:communityId/members', communityController.getMembers);
router.post('/:communityId/kick/:userId', authenticateToken, communityController.kickMember);

module.exports = router;