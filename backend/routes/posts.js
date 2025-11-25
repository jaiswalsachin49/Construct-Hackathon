const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middlewares/auth');
const upload = require('../config/multer');

router.get('/feed', authenticateToken, postController.getFeed);
router.get('/global', authenticateToken, postController.getGlobalFeed);
router.get('/user/:userId', authenticateToken, postController.getUserPosts); // New route
router.post('/', authenticateToken, upload.array('media', 10), postController.createPost);
router.put('/:postId', authenticateToken, postController.updatePost);
router.delete('/:postId', authenticateToken, postController.deletePost);
router.post('/:postId/like', authenticateToken, postController.toggleLike);
router.get('/:postId/likes', authenticateToken, postController.getPostLikes); // New route
router.post('/:postId/comment', authenticateToken, postController.addComment);
router.delete('/:postId/comment/:commentId', authenticateToken, postController.deleteComment);
router.post('/:postId/share', authenticateToken, postController.sharePost);

module.exports = router;