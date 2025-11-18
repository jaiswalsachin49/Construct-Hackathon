const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middlewares/auth');

router.get('/conversations', authenticateToken, chatController.getConversations);
router.post('/start', authenticateToken, chatController.startConversation);
router.get('/:conversationId/messages', authenticateToken, chatController.getMessages);
router.delete('/:conversationId', authenticateToken, chatController.deleteConversation);

module.exports = router;