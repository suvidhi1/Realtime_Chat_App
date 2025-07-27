// server/routes/chat.js - Production Version
const express = require('express');
const router = express.Router();
const { 
    getUserChats,
    createChat,
    getChatMessages,
    sendMessage,
    markMessagesAsRead
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

console.log('🔧 Loading production chat routes...');

// Apply authentication to all chat routes
router.use(auth);

// Chat routes
router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', sendMessage);
router.put('/:chatId/read', markMessagesAsRead);

// Route info endpoint
router.get('/info', (req, res) => {
    res.json({
        message: 'Chat API Routes',
        user: req.user.username,
        endpoints: [
            'GET / - Get user chats',
            'POST / - Create new chat',
            'GET /:chatId/messages - Get chat messages',
            'POST /:chatId/messages - Send message',
            'PUT /:chatId/read - Mark messages as read'
        ],
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ Production chat routes loaded');

module.exports = router;