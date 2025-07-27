// server/routes/friend.js - Friend System Routes
const express = require('express');
const router = express.Router();
const { 
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendRequests
} = require('../controllers/friendController');
const { auth } = require('../middleware/auth');
const { validateUserId } = require('../middleware/validation');

console.log('🔧 Loading friend system routes...');

// Apply authentication to all friend routes
router.use(auth);

// Friend management routes
router.post('/:userId/request', validateUserId, sendFriendRequest);
router.post('/requests/:requestId/accept', acceptFriendRequest);
router.post('/requests/:requestId/decline', declineFriendRequest);
router.delete('/:friendId', validateUserId, removeFriend);
router.get('/requests', getFriendRequests);

// Get user's friends list
router.get('/', async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id)
            .populate('friends', 'username avatar isOnline lastSeen')
            .select('friends');

        res.json({
            success: true,
            friends: user.friends,
            count: user.friends.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get friends list' });
    }
});

// Route info endpoint
router.get('/info', (req, res) => {
    res.json({
        message: 'Friend System API',
        user: req.user.username,
        endpoints: [
            'GET / - Get friends list',
            'POST /:userId/request - Send friend request',
            'POST /requests/:requestId/accept - Accept friend request',
            'POST /requests/:requestId/decline - Decline friend request',
            'DELETE /:friendId - Remove friend',
            'GET /requests - Get pending friend requests'
        ],
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ Friend system routes loaded');

module.exports = router;

