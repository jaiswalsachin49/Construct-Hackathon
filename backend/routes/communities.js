const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authenticateToken = require('../middlewares/auth');
const upload = require('../config/multer');
const postController = require('../controllers/postController');

router.get('/nearby', authenticateToken, communityController.getNearbyCommunities);
router.get('/my', authenticateToken, communityController.getMyCommunities);
router.post('/', authenticateToken, upload.single('coverImage'), communityController.createCommunity);
router.get('/search', authenticateToken, communityController.searchCommunities);
router.get('/:communityId', communityController.getCommunity);
router.post('/:communityId/join', authenticateToken, communityController.joinCommunity);
router.post('/:communityId/leave', authenticateToken, communityController.leaveCommunity);
router.get('/:communityId/members', communityController.getMembers);
router.post('/:communityId/kick/:userId', authenticateToken, communityController.kickMember);
router.put('/:communityId/members/:userId/role', authenticateToken, communityController.updateMemberRole);
router.get('/:communityId/messages', authenticateToken, communityController.getCommunityMessages);
router.delete('/:communityId', authenticateToken, communityController.deleteCommunity);

router.get('/:communityId/posts', authenticateToken, postController.getCommunityPosts);
router.post('/:communityId/posts', authenticateToken, postController.createCommunityPost);

module.exports = router;